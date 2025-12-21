import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClaimHeader } from "@/components/claim-header";
import { ImageUpload } from "@/components/image-upload";
import { DamageAssessment } from "@/components/damage-assessment";
import { ConfidenceDisplay } from "@/components/confidence-display";
import { CostEstimate } from "@/components/cost-estimate";
import { VehicleInfo } from "@/components/vehicle-info";
import { ActionPanel } from "@/components/action-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Car, Clock, CheckCircle, AlertTriangle, FileText, Plus } from "lucide-react";
import type { Claim, DamageItem } from "@shared/schema";

function ClaimsList({ 
  claims, 
  isLoading, 
  onSelectClaim 
}: { 
  claims: Claim[] | undefined; 
  isLoading: boolean;
  onSelectClaim: (claim: Claim) => void;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { variant: "default" as const, icon: CheckCircle, className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" };
      case "flagged":
        return { variant: "default" as const, icon: AlertTriangle, className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" };
      case "in_review":
        return { variant: "default" as const, icon: Clock, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
      default:
        return { variant: "secondary" as const, icon: FileText, className: "" };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Claims History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Claims History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No claims yet. Upload an image below to create your first claim.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Claims History
          <Badge variant="secondary">{claims.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {claims.map((claim) => {
            const statusInfo = getStatusBadge(claim.status);
            const StatusIcon = statusInfo.icon;
            const claimDate = new Date(claim.claimDate);
            
            return (
              <button
                key={claim.id}
                onClick={() => onSelectClaim(claim)}
                className="w-full flex items-center justify-between gap-4 p-4 border rounded-md hover-elevate active-elevate-2 text-left transition-colors"
                data-testid={`claim-row-${claim.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                    <Car className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      <span>{claim.vehicleInfo.year} {claim.vehicleInfo.make} {claim.vehicleInfo.model}</span>
                      <Badge className={statusInfo.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {claim.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                      <span>{claim.policyNumber}</span>
                      <span>{claimDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">${claim.totalEstimate.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{claim.damages?.length || 0} items</div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function NewClaimSection({
  onImageUpload,
  isProcessing,
}: {
  onImageUpload: (imageData: string) => void;
  isProcessing: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Claim Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ImageUpload
          onImageUpload={onImageUpload}
          isProcessing={isProcessing}
          currentImage={null}
          onClear={() => {}}
        />
      </CardContent>
    </Card>
  );
}

function ClaimDetail({
  claim,
  onBack,
  onUpdateDamage,
  onApprove,
  onFlag,
  isProcessing,
}: {
  claim: Claim;
  onBack: () => void;
  onUpdateDamage: (id: string, updates: Partial<DamageItem>) => void;
  onApprove: () => void;
  onFlag: () => void;
  isProcessing: boolean;
}) {
  const [agentNotes, setAgentNotes] = useState(claim.agentNotes || "");
  const { toast } = useToast();

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved.",
    });
  };

  const isCompleted = claim.status === "approved" || claim.status === "flagged";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">
            {claim.vehicleInfo.year} {claim.vehicleInfo.make} {claim.vehicleInfo.model}
          </h2>
          <p className="text-sm text-muted-foreground">{claim.policyNumber}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {claim.imageUrl && (
            <Card>
              <CardContent className="p-4">
                <img
                  src={claim.imageUrl}
                  alt="Vehicle damage"
                  className="w-full h-auto rounded-md object-contain max-h-96"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <VehicleInfo claim={claim} />
          <ConfidenceDisplay confidence={claim.overallConfidence} />
          <DamageAssessment 
            damages={claim.damages || []}
            onUpdateDamage={isCompleted ? undefined : onUpdateDamage}
          />
          <CostEstimate damages={claim.damages || []} />
          {!isCompleted && (
            <ActionPanel
              onApprove={onApprove}
              onFlag={onFlag}
              onSaveDraft={handleSaveDraft}
              isProcessing={isProcessing}
              hasAssessment={true}
              notes={agentNotes}
              onNotesChange={setAgentNotes}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClaimsWorkspace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const { data: claims, isLoading: isLoadingClaims } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });

  // Fetch full claim data (including image) when a claim is selected
  const { data: selectedClaim, isLoading: isLoadingSelectedClaim } = useQuery<Claim>({
    queryKey: ["/api/claims", selectedClaimId],
    enabled: !!selectedClaimId,
  });

  const assessMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/claims/assess", { imageData });
      return await response.json() as Claim;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      setSelectedClaimId(data.id);
      toast({
        title: "Assessment Complete",
        description: "AI damage assessment has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Assessment Failed",
        description: "Unable to process the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateDamageMutation = useMutation({
    mutationFn: async ({ claimId, damageId, updates }: { claimId: string; damageId: string; updates: Partial<DamageItem> }) => {
      const response = await apiRequest("PATCH", `/api/claims/${claimId}/damage/${damageId}`, updates);
      return await response.json() as DamageItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      toast({
        title: "Estimate Updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const response = await apiRequest("POST", `/api/claims/${claimId}/approve`, {});
      return await response.json() as Claim;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/claims", selectedClaimId] });
      toast({
        title: "Claim Approved",
        description: "The estimate has been forwarded for final review.",
      });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const response = await apiRequest("POST", `/api/claims/${claimId}/flag`, {});
      return await response.json() as Claim;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/claims", selectedClaimId] });
      toast({
        title: "Claim Flagged",
        description: "The claim has been flagged for manual review.",
      });
    },
  });

  const handleImageUpload = (imageData: string) => {
    assessMutation.mutate(imageData);
  };

  const handleUpdateDamage = (damageId: string, updates: Partial<DamageItem>) => {
    if (selectedClaim) {
      updateDamageMutation.mutate({ claimId: selectedClaim.id, damageId, updates });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClaimHeader claim={selectedClaim} />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {selectedClaimId ? (
          isLoadingSelectedClaim || !selectedClaim ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-muted-foreground">Loading claim details...</span>
              </div>
            </div>
          ) : (
            <ClaimDetail
              claim={selectedClaim}
              onBack={() => setSelectedClaimId(null)}
              onUpdateDamage={handleUpdateDamage}
              onApprove={() => approveMutation.mutate(selectedClaim.id)}
              onFlag={() => flagMutation.mutate(selectedClaim.id)}
              isProcessing={approveMutation.isPending || flagMutation.isPending}
            />
          )
        ) : (
          <div className="space-y-6">
            <ClaimsList
              claims={claims}
              isLoading={isLoadingClaims}
              onSelectClaim={(claim) => setSelectedClaimId(claim.id)}
            />
            <NewClaimSection
              onImageUpload={handleImageUpload}
              isProcessing={assessMutation.isPending}
            />
          </div>
        )}
      </main>
    </div>
  );
}

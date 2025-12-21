import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClaimHeader } from "@/components/claim-header";
import { ImageUpload } from "@/components/image-upload";
import { DamageAssessment } from "@/components/damage-assessment";
import { ConfidenceDisplay } from "@/components/confidence-display";
import { CostEstimate } from "@/components/cost-estimate";
import { VehicleInfo } from "@/components/vehicle-info";
import { ActionPanel } from "@/components/action-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Claim, DamageItem } from "@shared/schema";

function EmptyState() {
  return (
    <Card className="h-full min-h-96">
      <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg 
            className="h-8 w-8 text-muted-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Active Assessment</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload an image of vehicle damage to begin the AI-powered assessment process.
        </p>
      </CardContent>
    </Card>
  );
}

function AssessmentSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-16 w-24" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClaimsWorkspace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [agentNotes, setAgentNotes] = useState("");

  const { data: currentClaim, isLoading: isLoadingClaim } = useQuery<Claim | null>({
    queryKey: ["/api/claims/current"],
  });

  const assessMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/claims/assess", { imageData });
      return await response.json() as Claim;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/claims/current"], data);
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DamageItem> }) => {
      const response = await apiRequest("PATCH", `/api/claims/damage/${id}`, updates);
      return await response.json() as DamageItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims/current"] });
      toast({
        title: "Estimate Updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/claims/approve", { notes: agentNotes });
      return await response.json() as Claim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims/current"] });
      toast({
        title: "Claim Approved",
        description: "The estimate has been forwarded for final review.",
      });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/claims/flag", { notes: agentNotes });
      return await response.json() as Claim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims/current"] });
      toast({
        title: "Claim Flagged",
        description: "The claim has been flagged for manual review.",
      });
    },
  });

  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    assessMutation.mutate(imageData);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    queryClient.setQueryData(["/api/claims/current"], null);
  };

  const handleUpdateDamage = (id: string, updates: Partial<DamageItem>) => {
    updateDamageMutation.mutate({ id, updates });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved.",
    });
  };

  const isProcessing = assessMutation.isPending;
  const hasAssessment = !!currentClaim && Array.isArray(currentClaim.damages) && currentClaim.damages.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <ClaimHeader claim={currentClaim} />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ImageUpload
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
              currentImage={uploadedImage}
              onClear={handleClearImage}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {isLoadingClaim || isProcessing ? (
              <AssessmentSkeleton />
            ) : hasAssessment && currentClaim ? (
              <>
                <VehicleInfo claim={currentClaim} />
                <ConfidenceDisplay confidence={currentClaim.overallConfidence} />
                <DamageAssessment 
                  damages={currentClaim.damages}
                  onUpdateDamage={handleUpdateDamage}
                />
                <CostEstimate damages={currentClaim.damages} />
                <ActionPanel
                  onApprove={() => approveMutation.mutate()}
                  onFlag={() => flagMutation.mutate()}
                  onSaveDraft={handleSaveDraft}
                  isProcessing={approveMutation.isPending || flagMutation.isPending}
                  hasAssessment={hasAssessment}
                  notes={agentNotes}
                  onNotesChange={setAgentNotes}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

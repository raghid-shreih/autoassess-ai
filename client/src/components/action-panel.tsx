import { useState } from "react";
import { Check, Flag, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ActionPanelProps {
  onApprove: () => void;
  onFlag: () => void;
  onSaveDraft: () => void;
  isProcessing: boolean;
  hasAssessment: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function ActionPanel({
  onApprove,
  onFlag,
  onSaveDraft,
  isProcessing,
  hasAssessment,
  notes,
  onNotesChange,
}: ActionPanelProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Agent Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add notes about this assessment..."
            value={notes}
            maxLength={5000}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-24 resize-none"
            data-testid="textarea-agent-notes"
          />

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isProcessing || !hasAssessment}
              data-testid="button-save-draft"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowFlagDialog(true)}
              disabled={isProcessing || !hasAssessment}
              data-testid="button-flag-review"
            >
              <Flag className="h-4 w-4 mr-2" />
              Request Review
            </Button>
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={isProcessing || !hasAssessment}
              data-testid="button-approve"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve Estimate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Estimate</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this damage assessment and repair estimate?
              This marks the claim as approved in this demo; no report is sent externally.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApprove();
                setShowApproveDialog(false);
              }}
              data-testid="button-confirm-approve"
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Manual Review</DialogTitle>
            <DialogDescription>
              This marks the claim for manual review in this demo.
              Please ensure you have added relevant notes explaining the reason for the flag.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onFlag();
                setShowFlagDialog(false);
              }}
              data-testid="button-confirm-flag"
            >
              Flag for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

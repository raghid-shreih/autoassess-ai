import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceDisplayProps {
  confidence: number;
  showExplanation?: boolean;
}

export function ConfidenceDisplay({ confidence, showExplanation = true }: ConfidenceDisplayProps) {
  const isHighConfidence = confidence >= 85;
  const isMediumConfidence = confidence >= 70 && confidence < 85;
  
  const getStatusColor = () => {
    if (isHighConfidence) return "text-green-600 dark:text-green-400";
    if (isMediumConfidence) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusBadge = () => {
    if (isHighConfidence) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          High Confidence
        </Badge>
      );
    }
    if (isMediumConfidence) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Info className="h-3 w-3 mr-1" />
          Review Recommended
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Manual Review Required
      </Badge>
    );
  };

  const getExplanation = () => {
    if (isHighConfidence) {
      return "AI assessment meets confidence threshold. Ready for approval.";
    }
    if (isMediumConfidence) {
      return "Some uncertainty detected. Review flagged items before approval.";
    }
    return "Low confidence score. Detailed manual review is required.";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2 flex-wrap">
          AI Confidence Score
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-5xl font-bold tabular-nums", getStatusColor())} data-testid="text-confidence-score">
            {confidence}
          </span>
          <span className="text-2xl text-muted-foreground">%</span>
        </div>
        
        <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isHighConfidence && "bg-green-500",
              isMediumConfidence && "bg-yellow-500",
              !isHighConfidence && !isMediumConfidence && "bg-red-500"
            )}
            style={{ width: `${confidence}%` }}
          />
        </div>

        {showExplanation && (
          <p className="mt-3 text-sm text-muted-foreground" data-testid="text-confidence-explanation">
            {getExplanation()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

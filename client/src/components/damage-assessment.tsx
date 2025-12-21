import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { DamageItem, SeverityLevel, RepairAction } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DamageAssessmentProps {
  damages: DamageItem[];
  onUpdateDamage?: (id: string, updates: Partial<DamageItem>) => void;
}

const severityColors: Record<SeverityLevel, string> = {
  minor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  severe: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function DamageItemRow({ 
  item, 
  onUpdate 
}: { 
  item: DamageItem; 
  onUpdate?: (updates: Partial<DamageItem>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = !!onUpdate;
  const [isExpanded, setIsExpanded] = useState(false);
  const [editValues, setEditValues] = useState({
    laborCost: item.laborCost,
    partsCost: item.partsCost,
    severity: item.severity,
    action: item.action,
  });

  const isLowConfidence = item.confidence < 85;
  const totalCost = item.laborCost + item.partsCost;

  const handleSave = () => {
    onUpdate?.(editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      laborCost: item.laborCost,
      partsCost: item.partsCost,
      severity: item.severity,
      action: item.action,
    });
    setIsEditing(false);
  };

  return (
    <div 
      className={cn(
        "rounded-lg border p-4",
        isLowConfidence && "border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-900/10"
      )}
      data-testid={`damage-item-${item.id}`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium" data-testid={`text-part-name-${item.id}`}>{item.part}</span>
            <Badge variant="outline" className="capitalize">
              {item.damageType}
            </Badge>
            <Badge className={severityColors[item.severity]}>
              {item.severity}
            </Badge>
            {isLowConfidence && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {item.confidence}% confidence
              </Badge>
            )}
          </div>
          
          {!isEditing && (
            <div className="mt-2 text-sm text-muted-foreground">
              Action: <span className="capitalize font-medium text-foreground">{item.action}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <div className="text-right">
                <div className="font-semibold tabular-nums" data-testid={`text-cost-${item.id}`}>
                  ${totalCost.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Parts: ${item.partsCost.toLocaleString()} | Labor: ${item.laborCost.toLocaleString()}
                </div>
              </div>
              {canEdit && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  data-testid={`button-edit-${item.id}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleSave} data-testid={`button-save-${item.id}`}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancel} data-testid={`button-cancel-${item.id}`}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Severity</label>
            <Select 
              value={editValues.severity} 
              onValueChange={(val) => setEditValues(prev => ({ ...prev, severity: val as SeverityLevel }))}
            >
              <SelectTrigger data-testid={`select-severity-${item.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Action</label>
            <Select 
              value={editValues.action} 
              onValueChange={(val) => setEditValues(prev => ({ ...prev, action: val as RepairAction }))}
            >
              <SelectTrigger data-testid={`select-action-${item.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="replace">Replace</SelectItem>
                <SelectItem value="paint">Paint</SelectItem>
                <SelectItem value="buff">Buff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Parts Cost</label>
            <Input 
              type="number"
              value={editValues.partsCost}
              onChange={(e) => setEditValues(prev => ({ ...prev, partsCost: Number(e.target.value) }))}
              data-testid={`input-parts-cost-${item.id}`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Labor Cost</label>
            <Input 
              type="number"
              value={editValues.laborCost}
              onChange={(e) => setEditValues(prev => ({ ...prev, laborCost: Number(e.target.value) }))}
              data-testid={`input-labor-cost-${item.id}`}
            />
          </div>
        </div>
      )}

      {item.reasoning && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
              {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
              AI Reasoning
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
              {item.reasoning}
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export function DamageAssessment({ damages, onUpdateDamage }: DamageAssessmentProps) {
  const flaggedCount = damages.filter(d => d.confidence < 85).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2 flex-wrap">
          Detected Damage
          <div className="flex items-center gap-2">
            {flaggedCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {flaggedCount} flagged
              </Badge>
            )}
            <Badge variant="outline">{damages.length} items</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {damages.map((item) => (
            <DamageItemRow 
              key={item.id} 
              item={item} 
              onUpdate={onUpdateDamage ? (updates) => onUpdateDamage(item.id, updates) : undefined}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

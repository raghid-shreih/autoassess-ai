import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DamageItem } from "@shared/schema";

interface CostEstimateProps {
  damages: DamageItem[];
}

export function CostEstimate({ damages }: CostEstimateProps) {
  const totalParts = damages.reduce((sum, d) => sum + d.partsCost, 0);
  const totalLabor = damages.reduce((sum, d) => sum + d.laborCost, 0);
  const grandTotal = totalParts + totalLabor;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="text-left pb-3 font-semibold">Part</th>
                <th className="text-right pb-3 font-semibold">Parts</th>
                <th className="text-right pb-3 font-semibold">Labor</th>
                <th className="text-right pb-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {damages.map((item) => (
                <tr key={item.id} className="border-b border-border/50" data-testid={`row-cost-${item.id}`}>
                  <td className="py-3 font-medium">{item.part}</td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground">
                    ${item.partsCost.toLocaleString()}
                  </td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground">
                    ${item.laborCost.toLocaleString()}
                  </td>
                  <td className="py-3 text-right tabular-nums font-medium">
                    ${(item.partsCost + item.laborCost).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Parts</span>
            <span className="tabular-nums">${totalParts.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Labor</span>
            <span className="tabular-nums">${totalLabor.toLocaleString()}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="font-semibold">Grand Total</span>
            <span className="text-xl font-bold tabular-nums" data-testid="text-grand-total">
              ${grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

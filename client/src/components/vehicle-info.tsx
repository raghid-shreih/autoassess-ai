import { Car, Calendar, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Claim } from "@shared/schema";

interface VehicleInfoProps {
  claim: Claim;
}

export function VehicleInfo({ claim }: VehicleInfoProps) {
  const { vehicleInfo, policyNumber, claimDate } = claim;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Car className="h-4 w-4" />
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Make / Model</dt>
            <dd className="font-medium" data-testid="text-vehicle-make-model">
              {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Color</dt>
            <dd className="font-medium capitalize" data-testid="text-vehicle-color">{vehicleInfo.color}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">VIN</dt>
            <dd className="font-mono text-xs" data-testid="text-vehicle-vin">{vehicleInfo.vin}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1">Policy #</dt>
            <dd className="font-medium" data-testid="text-policy-number">{policyNumber}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground text-xs uppercase tracking-wide font-medium mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Claim Date
            </dt>
            <dd className="font-medium" data-testid="text-claim-date">
              {new Date(claimDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

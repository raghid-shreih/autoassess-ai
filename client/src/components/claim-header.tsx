import { Car, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import type { Claim } from "@shared/schema";

interface ClaimHeaderProps {
  claim?: Claim | null;
}

export function ClaimHeader({ claim }: ClaimHeaderProps) {
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      in_review: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      flagged: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return statusStyles[status] || "";
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">AutoAssess AI</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4" data-testid="header-claim-info">
        {claim && claim.id && claim.status && (
          <>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Claim #{claim.id.slice(0, 8)}</span>
              <Badge size="sm" className={getStatusBadge(claim.status)}>
                {claim.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="hidden md:block h-6 w-px bg-border" />
          </>
        )}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Claims Agent</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

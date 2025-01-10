"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, User } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipTitle,
  TooltipDescription,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GlossaryRole } from "../types";
import { PowerMeter } from "../metrics/power-meter";
import { getQualityTier } from "../utils/quality-tier";
import { BadgeMarker } from "../status/badge-marker";
import { RoleStatus } from "../status/role-status";

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export const columns: ColumnDef<GlossaryRole>[] = [
  {
    accessorKey: "role_name",
    enableSorting: true,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className={cn(
          "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs ml-[44px] flex items-center gap-3",
          column.getIsSorted() && "text-foreground"
        )}
      >
        Role
        <ArrowDown 
          className={cn(
            "h-3 w-3 transition-all duration-75 opacity-0",
            "hover:opacity-100",
            column.getIsSorted() && [
              "opacity-100",
              column.getIsSorted() === "asc" && "rotate-180"
            ]
          )}
        />
      </Button>
    ),
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="flex items-center gap-5">
          <BadgeMarker type={role.badge} />
          <span className="text-base font-medium">{role.role_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "active_users",
    enableSorting: true,
    sortDescFirst: true,
    sortingFn: "basic",
    header: ({ column }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className={cn(
                "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs w-full text-right flex items-center justify-end gap-3",
                column.getIsSorted() && "text-foreground"
              )}
            >
              <ArrowDown 
                className={cn(
                  "h-3 w-3 transition-all duration-75 opacity-0",
                  "hover:opacity-100",
                  column.getIsSorted() && [
                    "opacity-100",
                    column.getIsSorted() === "asc" && "rotate-180"
                  ]
                )}
              />
              Distribution
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TooltipTitle>YO BERAS! Role Check 🐻</TooltipTitle>
            <TooltipDescription>
              See how many based Beras are repping this role in our active fam (last 30 days)
            </TooltipDescription>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    cell: ({ row }) => {
      const activeUsers = row.getValue("active_users") as number;
      const activePercentage = row.original.active_percentage;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-end">
                <div className="flex items-center gap-[6px]">
                  <User weight="fill" className="w-[14px] h-[14px] text-muted-foreground/50" />
                  <div className="text-sm text-muted-foreground font-mono">
                    {formatNumber(activeUsers)}
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipTitle>{activeUsers.toLocaleString()} ACTIVE BERAS 🔥</TooltipTitle>
              <TooltipDescription>
                {activePercentage.toFixed(1)}% of our chatty fam is rocking this role rn
              </TooltipDescription>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "additions",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const netChangeA = (rowA.original.additions || 0) - (rowA.original.removals || 0);
      const netChangeB = (rowB.original.additions || 0) - (rowB.original.removals || 0);
      return netChangeA - netChangeB;
    },
    header: ({ column }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className={cn(
                "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs w-full text-right flex items-center justify-end gap-3",
                column.getIsSorted() && "text-foreground"
              )}
            >
              <ArrowDown 
                className={cn(
                  "h-3 w-3 transition-all duration-75 opacity-0",
                  "hover:opacity-100",
                  column.getIsSorted() && [
                    "opacity-100",
                    column.getIsSorted() === "asc" && "rotate-180"
                  ]
                )}
              />
              14 Day
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TooltipTitle>Role Status Changes 👀</TooltipTitle>
            <TooltipDescription>
              Changes in role assignments among consistently active beras (comparing 14 days ago vs now)
            </TooltipDescription>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    cell: ({ row }) => {
      const additions = row.original.additions || 0;
      const removals = row.original.removals || 0;
      const hasChanges = additions > 0 || removals > 0;
      const netChange = additions - removals;

      if (!hasChanges) {
        return <div className="text-muted-foreground text-xs text-right w-full">-</div>;
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-end w-full">
                <div className={cn(
                  "flex items-center gap-2 text-xs font-mono relative",
                  netChange > 0 ? "text-GNEON/80" : netChange < 0 ? "text-RNEON/80" : "text-muted-foreground"
                )}>
                  {netChange > 0 ? (
                    <>
                      <ArrowUp weight="bold" className="w-3 h-3" />
                      <span>{formatNumber(netChange)}</span>
                      {additions >= 100 && <span className="absolute hidden -right-7">🔥</span>}
                    </>
                  ) : netChange < 0 ? (
                    <>
                      <ArrowDown weight="bold" className="w-3 h-3" />
                      <span>{formatNumber(Math.abs(netChange))}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipDescription className="flex flex-col gap-1">
                <span className="font-medium">
                  {netChange > 0 
                    ? `mods blessing the fam 🎁 `
                    : netChange < 0 
                    ? `mods taking back their gifts ngl 🫳 `
                    : "mods sleeping on this one 😴"}
                </span>
                <div className="text-xs text-muted-foreground flex flex-col gap-1">
                  <div className="text-GNEON/80">+{additions} roles added 🙏</div>
                  <div className="text-RNEON/80">-{removals} roles snatched 🫳</div>
                </div>
              </TooltipDescription>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "avg_quality_score",
    enableSorting: true,
    header: ({ column }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting()}
              className={cn(
                "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs w-full text-right flex items-center justify-end gap-3",
                column.getIsSorted() && "text-foreground"
              )}
            >
              <ArrowDown 
                className={cn(
                  "h-3 w-3 transition-all duration-75 opacity-0",
                  "hover:opacity-100",
                  column.getIsSorted() && [
                    "opacity-100",
                    column.getIsSorted() === "asc" && "rotate-180"
                  ]
                )}
              />
              Vibe Check
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TooltipTitle>COMMUNITY VIBE CHECK 🍯</TooltipTitle>
            <TooltipDescription>
              Based on chat activity + engagement, with multipliers for bigger squads fr fr 🔥
            </TooltipDescription>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    cell: ({ row }) => {
      const score = row.getValue("avg_quality_score") as number;
      const badge = row.original.badge;
      const category = row.original.role_category;
      const active_users = row.original.active_users;
      const tier = getQualityTier(score, badge, category, active_users);
      const isTeamRole = (badge === "TEAM" || badge === "SYSTEM" || category === "Bot" || category === "Moderator") && score >= 30;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-end">
                <PowerMeter level={tier.fires} color={tier.color} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipTitle>
                {score >= 0 ? `BASED LEVEL: ${score.toFixed(1)} 🔥` : 'TOO BASED TO MEASURE 👑'}
              </TooltipTitle>
              <div className="flex flex-col gap-1">
                <TooltipDescription>
                  {tier.tooltip}
                </TooltipDescription>
                {isTeamRole && (
                  <TooltipDescription className="text-muted-foreground">
                    team role tho so kinda cheating 🫣
                  </TooltipDescription>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "attainability_type",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue("attainability_type") as "OPEN" | "RESTRICTED" | "CLOSED" | "UNCLEAR";
      const b = rowB.getValue("attainability_type") as "OPEN" | "RESTRICTED" | "CLOSED" | "UNCLEAR";
      
      // Custom sort order: OPEN > RESTRICTED > CLOSED > UNCLEAR
      const sortOrder: Record<"OPEN" | "RESTRICTED" | "CLOSED" | "UNCLEAR", number> = {
        "OPEN": 4,
        "RESTRICTED": 3,
        "CLOSED": 2,
        "UNCLEAR": 1
      };
      return (sortOrder[a] || 0) - (sortOrder[b] || 0);
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className={cn(
          "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs w-full text-right flex items-center justify-end gap-3",
          column.getIsSorted() && "text-foreground"
        )}
      >
        <ArrowDown 
          className={cn(
            "h-3 w-3 transition-all duration-75 opacity-0",
            "hover:opacity-100",
            column.getIsSorted() && [
              "opacity-100",
              column.getIsSorted() === "asc" && "rotate-180"
            ]
          )}
        />
        Role Status
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("attainability_type") as "OPEN" | "CLOSED" | "RESTRICTED" | "UNCLEAR";
      return (
        <div className="flex justify-end">
          <RoleStatus type={type} />
        </div>
      );
    },
  }
]; 
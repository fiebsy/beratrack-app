"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "@phosphor-icons/react";
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
import { PowerMeter } from "./power-meter";
import { RarityMeter } from "./rarity-meter";
import { getQualityTier } from "./quality-tier";
import { BadgeMarker } from "./badge-marker";

export const columns: ColumnDef<GlossaryRole>[] = [
  {
    accessorKey: "role_name",
    enableSorting: true,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className={cn(
          "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs ml-[44px]",
          column.getIsSorted() && "text-foreground"
        )}
      >
        Role
        <ArrowDown 
          className={cn(
            "ml-2 h-3 w-3 transition-all duration-75 opacity-0",
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
    header: ({ column }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className={cn(
                "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs",
                column.getIsSorted() && "text-foreground"
              )}
            >
              Distribution
              <ArrowDown 
                className={cn(
                  "ml-2 h-3 w-3 transition-all duration-75 opacity-0",
                  "hover:opacity-100",
                  column.getIsSorted() && [
                    "opacity-100",
                    column.getIsSorted() === "asc" && "rotate-180"
                  ]
                )}
              />
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
              <div>
                <RarityMeter activeUsers={activeUsers} />
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
                "p-0 font-medium hover:bg-transparent hover:text-foreground text-xs",
                column.getIsSorted() && "text-foreground"
              )}
            >
              Vibe Check
              <ArrowDown 
                className={cn(
                  "ml-2 h-3 w-3 transition-all duration-75 opacity-0",
                  "hover:opacity-100",
                  column.getIsSorted() && [
                    "opacity-100",
                    column.getIsSorted() === "asc" && "rotate-180"
                  ]
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <TooltipTitle>COMMUNITY VIBE CHECK 🍯</TooltipTitle>
            <TooltipDescription>
              Your BASED LEVEL comes from chat activity (30pts), reactions (25pts), replies (15pts), and convo starters (10pts). Bigger squads get up to 1.5x bonus fr fr 🔥
            </TooltipDescription>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    cell: ({ row }) => {
      const score = row.getValue("avg_quality_score") as number;
      const badge = row.original.badge;
      const category = row.original.role_category;
      const tier = getQualityTier(score, badge, category);
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <PowerMeter level={tier.fires} color={tier.color} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipTitle>
                {score >= 0 ? `BASED LEVEL: ${score.toFixed(1)} 🔥` : 'TOO BASED TO MEASURE 👑'}
              </TooltipTitle>
              <TooltipDescription>
                {tier.tooltip}
              </TooltipDescription>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  }
]; 
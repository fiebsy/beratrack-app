"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  getRoleDescription, 
  getRoleCategory, 
  getKnownRole,
  type RoleCategory 
} from "@/lib/roles/known-roles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { XIcon, HelpCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoleStats {
  role_name: string;
  category: RoleCategory;
  users_with_role: number;
  percent_of_active_users: number;
  engagement_rating: number;
  attainability_rating: number;
  total_messages: number;
  messages_per_user: number;
  threads_participated: number;
  avg_reactions: number;
  avg_replies: number;
}

function getCategoryBadgeVariant(category: RoleCategory): "default" | "secondary" | "outline" | "destructive" | "theme" {
  switch (category) {
    case "Team":
    case "Moderator":
      return "destructive";
    case "Helper":
    case "Community":
      return "default";
    case "NFT Holder":
      return "secondary";
    case "System":
    case "Bot":
      return "theme";
    case "Governance":
      return "secondary";
    case "Unknown":
    default:
      return "outline";
  }
}

function getCategoryDisplay(category: RoleCategory, subcategory?: string): string {
  if (category === "Unknown") return "Unknown";
  if (subcategory) return subcategory;
  return category;
}

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roleName: string;
  description: string;
  stats: RoleStats;
}

function RoleDialog({ isOpen, onClose, roleName, description, stats }: RoleDialogProps) {
  const category = getRoleCategory(roleName);
  const role = getKnownRole(roleName);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{roleName}</DialogTitle>
            <Badge 
              variant={getCategoryBadgeVariant(category)} 
              className="text-[10px] px-2 py-0"
            >
              {getCategoryDisplay(category, role?.subcategory)}
            </Badge>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Statistics</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Total Users</dt>
                <dd>{stats.users_with_role.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Messages/User</dt>
                <dd>{stats.messages_per_user.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Engagement Rating</dt>
                <dd>{stats.engagement_rating.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Attainability Rating</dt>
                <dd>{stats.attainability_rating?.toFixed(1) || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Threads Participated</dt>
                <dd>{stats.threads_participated.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">% of Active Users</dt>
                <dd>{stats.percent_of_active_users.toFixed(1)}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AttainabilityIndicator({ rating, category }: { rating: number, category: RoleCategory }) {
  let indicator: React.ReactElement;
  let description: string;
  let textColor: string;
  
  if (category === "Unknown") {
    indicator = <HelpCircleIcon className="w-4 h-4" />;
    description = "Unknown Access";
    textColor = "text-muted-foreground";
  }
  else if (rating === 0) {
    indicator = <XIcon className="w-4 h-4" />;
    description = "Restricted";
    textColor = "text-destructive";
  }
  else {
    // Calculate color and description based on rating
    if (rating < 20) {
      textColor = "text-red-500";
      description = "Very Hard to Obtain";
    }
    else if (rating < 40) {
      textColor = "text-orange-500";
      description = "Hard to Obtain";
    }
    else if (rating < 70) {
      textColor = "text-yellow-500";
      description = "Moderate Effort";
    }
    else {
      textColor = "text-emerald-500";
      description = "Easy to Obtain";
    }
    
    indicator = (
      <div 
        className={cn(
          "w-3 h-3 rounded-full opacity-80",
          textColor.replace('text-', 'bg-')
        )}
      />
    );
  }
  
  return (
    <div className="flex items-center justify-end gap-2">
      <span className={cn("text-sm", textColor)}>{description}</span>
      {indicator}
    </div>
  );
}

export const columns: ColumnDef<RoleStats>[] = [
  {
    accessorKey: "category",
    header: "Type",
    cell: ({ row }) => {
      const role_name = row.getValue("role_name") as string;
      const category = getRoleCategory(role_name);
      const role = getKnownRole(role_name);
      
      return (
        <Badge 
          variant={getCategoryBadgeVariant(category)} 
          className="text-[10px] px-2 py-0"
        >
          {getCategoryDisplay(category, role?.subcategory)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "role_name",
    header: "Role",
    cell: function RoleCell({ row }) {
      const [dialogOpen, setDialogOpen] = useState(false);
      const role_name = row.getValue("role_name") as string;
      const description = getRoleDescription(role_name);
      
      return (
        <>
          <button
            onClick={() => setDialogOpen(true)}
            className="text-left hover:underline"
          >
            <span className="font-medium">{role_name}</span>
          </button>
          <RoleDialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            roleName={role_name}
            description={description}
            stats={row.original}
          />
        </>
      );
    },
  },
  {
    accessorKey: "users_with_role",
    header: "Users",
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {new Intl.NumberFormat().format(row.getValue("users_with_role"))}
        </div>
      );
    },
  },
  {
    accessorKey: "percent_of_active_users",
    header: "% of Active Users",
    cell: ({ row }) => {
      const percent = row.getValue("percent_of_active_users") as number;
      return (
        <div className="w-full flex items-center gap-2">
          <Progress value={percent} className="w-full" />
          <span className="text-muted-foreground min-w-[3rem] text-right">
            {percent.toFixed(1)}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "messages_per_user",
    header: "Msgs/User",
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {new Intl.NumberFormat().format(row.getValue("messages_per_user"))}
        </div>
      );
    },
  },
  {
    accessorKey: "threads_participated",
    header: "Threads",
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {new Intl.NumberFormat().format(row.getValue("threads_participated"))}
        </div>
      );
    },
  },
  {
    accessorKey: "engagement_rating",
    header: "Engagement",
    cell: ({ row }) => {
      const rating = row.getValue("engagement_rating") as number;
      let badgeVariant: "default" | "secondary" | "destructive" = "default";
      
      if (rating < 30) badgeVariant = "destructive";
      else if (rating < 40) badgeVariant = "secondary";
      
      return (
        <div className="text-right">
          <Badge variant={badgeVariant}>{rating.toFixed(1)}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "attainability_rating",
    header: "Attainability",
    cell: ({ row }) => {
      const rating = row.getValue("attainability_rating") as number;
      const role_name = row.getValue("role_name") as string;
      const category = getRoleCategory(role_name);
      
      return <AttainabilityIndicator rating={rating} category={category} />;
    },
  },
]; 
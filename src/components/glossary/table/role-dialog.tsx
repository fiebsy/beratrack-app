"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GlossaryRole } from "../types";
import { Badge } from "@/components/ui/badge";
import { BadgeMarker } from "./badge-marker";
import { PowerMeter } from "./power-meter";
import { PercentageBar } from "./percentage-bar";
import { Trophy, User, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { getQualityTier } from "./quality-tier";
import { formatBadgeText } from "./utils";

const BADGE_COLORS = {
  "NFT": "text-fuchsia-400",
  "COMMUNITY": "text-sky-400",
  "SERVICE": "text-amber-400",
  "SYSTEM": "text-emerald-400",
  "TEAM": "text-rose-400",
  "UNCLEAR": "text-gray-500",
} as const;

interface RoleDialogProps {
  role: GlossaryRole | null;
  onOpenChange: (open: boolean) => void;
}

export function RoleDialog({ role, onOpenChange }: RoleDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (role) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.height = 'auto';
    };
  }, [role]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current === e.target) {
        onOpenChange(false);
      }
    };

    if (role) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [role, onOpenChange]);

  if (!role) return null;

  const tier = getQualityTier(role.avg_quality_score, role.badge, role.role_category);
  const lastUpdated = new Date(role.last_updated).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const badgeColor = BADGE_COLORS[role.badge];

  const content = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal
      aria-labelledby="dialog-title"
      className={cn(
        "relative bg-black rounded-[24px] min-h-fit overflow-visible",
        "transform animate-in fade-in-0 zoom-in-95",
        "absolute nm:left-[5%] nm:right-[5%] left-0 right-0 top-5 nm:top-[40px]",
        "max-w-[800px] mx-auto mb-[80px]"
      )}
    >
      <div className="relative z-10">
        <div className="sticky top-0 z-[100]">
          <div className="absolute inset-x-0 top-0 h-24 rounded-t-[24px]" />
          <div className="relative flex justify-end p-4 nm:p-6 tablet:p-8">
            <button
              ref={closeButtonRef}
              onClick={() => onOpenChange(false)}
              className="text-[#c4c4c4] hover:text-white/50 transition-colors focus:outline-none -mt-2"
              aria-label="Close dialog"
            >
              <X size={40} weight="bold" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-0 nm:p-8 nm:pt-0 tablet:pt-0 tablet:p-[80px] flex flex-col w-full">
            {/* Header */}
            <div className="flex items-start gap-3 pr-8">
              <div className="flex-shrink-0 mt-[-2px] sm:pt-[6px]">
                <BadgeMarker type={role.badge} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col desktop:flex-row desktop:items-center items-start gap-2 desktop:gap-5">
                  <h2 
                    id="dialog-title" 
                    className="text-xl sm:text-2xl truncate w-full desktop:w-auto leading-none text-foreground "
                  >
                    {role.role_name}
                  </h2>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] tracking-wider font-medium border-current whitespace-nowrap ${badgeColor}`}
                  >
                    {formatBadgeText(role.badge)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6 space-y-2">
              <div className="text-sm text-foreground font-medium">What is this role?</div>
              <p className="text-sm sm:text-base text-muted-foreground">
                {role.role_description}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4 sm:space-y-6 mt-8">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {/* Distribution Stats */}
                <div className="p-4 sm:p-6 rounded-lg border bg-N930">
                  <div className="flex items-center justify-between mb-6">
                    <div className="font-medium">Squad Check</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User weight="fill" className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-mono">{role.total_active_users.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Role Distribution</div>
                      <div className="text-2xl sm:text-3xl font-mono tabular-nums leading-none">
                        {((role.active_users / role.total_active_users) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <PercentageBar 
                      percentage={(role.active_users / role.total_active_users) * 200}
                      totalCount={role.total_active_users}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground/80">
                    {role.active_users.toLocaleString()} of the {role.total_active_users.toLocaleString()} active Beras are repping this role rn
                  </p>
                </div>

                {/* Quality Score */}
                <div className="p-4 sm:p-6 rounded-lg border bg-N930">
                  <div className="flex items-center justify-between mb-6">
                    <div className="font-medium">Vibe Check</div>
                    {role.badge !== 'TEAM' && role.role_category !== 'Bot' && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Trophy weight="fill" className="w-3.5 h-3.5 text-theme" />
                        <span>Rank #{role.quality_rank}</span>
                        <span className="text-muted-foreground/50">of {role.total_roles}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col justify-between space-y-2">
                      <div className="text-xs text-muted-foreground">BASED Level 🔥</div>
                      <div className="text-2xl sm:text-3xl font-mono tabular-nums leading-none">
                        {role.avg_quality_score.toFixed(1)}
                      </div>
                    </div>
                    <PowerMeter 
                      level={tier.fires} 
                      color={tier.color}
                      variant="large"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground/80">
                    {tier.tooltip}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground/50 text-right pt-2">
                Last check: {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-N920/50 backdrop-blur-sm z-[100] flex items-start justify-center overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      {content}
    </div>,
    document.body
  );
} 
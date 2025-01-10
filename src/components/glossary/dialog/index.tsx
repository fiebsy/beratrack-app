"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GlossaryRole } from "@/components/glossary/types";
import { Badge } from "@/components/ui/badge";
import { BadgeMarker } from "@/components/glossary/status/badge-marker";
import { PowerMeter } from "@/components/glossary/metrics/power-meter";
import { PercentageBar } from "@/components/glossary/metrics/percentage-bar";
import { Trophy, User, X, XCircle, ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { getQualityTier } from "@/components/glossary/utils/quality-tier";
import { formatBadgeText } from "@/components/glossary/utils/utils";
import { RoleStatus } from "@/components/glossary/status/role-status";

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

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

  const tier = getQualityTier(role.avg_quality_score, role.badge, role.role_category, role.active_users);
  const lastUpdated = new Date(role.last_updated).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const additions = role.additions || 0;
  const removals = role.removals || 0;
  const netChange = additions - removals;

  const badgeColor = BADGE_COLORS[role.badge];

  const content = (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-N920/50 backdrop-blur-sm z-[100] flex items-start justify-center overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal
        aria-labelledby="dialog-title"
        className={cn(
          "relative bg-black rounded-[24px] min-h-fit overflow-visible w-full",
          "transform animate-in fade-in-0 zoom-in-95",
          "nm:mx-[5%] mx-0 my-5 nm:my-[40px]",
          "max-w-[800px]"
        )}
      >
        <div className="relative z-10">
          <div className="sticky top-0 z-[100] rounded-t-[24px]">
            <div className="absolute inset-x-0 top-0 h-24 rounded-t-[24px]" />
            <div className="relative flex justify-end p-4 nm:p-6 tablet:p-8">
              <button
                ref={closeButtonRef}
                onClick={() => onOpenChange(false)}
                className="text-[#c4c4c4] hover:text-white/50 transition-colors focus:outline-none -mt-2"
                aria-label="Close dialog"
              >
                <div className="desktop:hidden nm:mr-[-4px] mr-[-10px]">
                  <XCircle size={40} weight="fill" />
                </div>
                <div className="hidden desktop:block">
                  <X size={40} weight="bold" />
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pt-0 gap-[40px] nm:p-8 nm:pt-0 tablet:pt-0 tablet:p-[80px] flex flex-col w-full">
              {/* Header */}
              <div className="flex flex-col gap-2 ">
                <div className="flex flex-col items-start gap-4 justify-between">
                  {/* Left side: BadgeMarker + Title */}
                  <div className='flex gap-2  justify-between w-full'>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 hidden">
                        <BadgeMarker type={role.badge} />
                        </div>
                        <div className="min-w-0 flex-shrink ">
                        <h2 
                            id="dialog-title" 
                            className="text-lg sm:text-2xl  leading-none text-foreground"
                        >
                            {role.role_name}
                        </h2>
                        </div>
                    </div>
                    <div className='hidden desktop:flex'>
                      <RoleStatus type={role.attainability_type as "OPEN" | "CLOSED" | "RESTRICTED" | "UNCLEAR"} variant="badge" />
                    </div>

                  </div>


                  {/* Right side: Badge Type + Role Status */}
                  <div className="flex items-start gap-6 flex-shrink-0 min-w-[200px] ">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] w-fit h-fit tracking-wider font-medium border-current whitespace-nowrap ${badgeColor}`}
                    >
                      {formatBadgeText(role.badge)}
                    </Badge>
                    <div className='flex items-center gap-2 desktop:hidden'>
                      <RoleStatus type={role.attainability_type as "OPEN" | "CLOSED" | "RESTRICTED" | "UNCLEAR"} variant="badge" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Analysis */}
              <div className="pt-6 space-y-[32px]">
                <div>
                  <div className=" text-foreground font-medium mb-2">What is this role?</div>
                  <p className="text-muted-foreground">
                    {role.role_description}
                  </p>
                </div>

                <div>
                  <div className="text-foreground font-medium mb-2">Role Analysis</div>
                  <div className=" text-muted-foreground space-y-2">
                    <div className="space-y-2">
                      {/* Squad Size */}
                      <p className="flex gap-2">
                        <span>👥</span>
                        <span>
                          Thiccness Level:{' '}
                          {role.active_users === 0 ? (
                            <>literally zero frens rn (ghost town fr fr 👻)</>
                          ) : role.active_users === 1 ? (
                            <>just <span className="font-mono text-theme">1</span> lone wolf in the squad ({((role.active_users / role.total_active_users) * 100).toFixed(1)}% of active members) (RARE)</>
                          ) : role.active_users <= 10 ? (
                            <><span className="font-mono text-theme">{formatNumber(role.active_users)}</span> smol but mighty frens ({((role.active_users / role.total_active_users) * 100).toFixed(1)}% of active members) (COZY)</>
                          ) : role.active_users <= 100 ? (
                            <><span className="font-mono text-theme">{formatNumber(role.active_users)}</span> BASED Beras in the squad ({((role.active_users / role.total_active_users) * 100).toFixed(1)}% of active members) (SOLID)</>
                          ) : role.active_users <= 1000 ? (
                            <><span className="font-mono text-theme">{formatNumber(role.active_users)}</span> BASED Beras in the fam ({((role.active_users / role.total_active_users) * 100).toFixed(1)}% of active members) (STACKED)</>
                          ) : (
                            <><span className="font-mono text-theme">{formatNumber(role.active_users)}</span> GIGACHAD Beras deep ({((role.active_users / role.total_active_users) * 100).toFixed(1)}% of active members) (MASSIVE)</>
                          )}
                        </span>
                      </p>

                      {/* Quality Score & Rank */}
                      <p className="flex gap-2">
                        <span>👑</span>
                        <span>
                          {role.badge === 'TEAM' || role.role_category === 'Bot' ? 'Kinda cheating ngl but still ' : ''}
                          {role.avg_quality_score >= 40 ? (
                            <>absolutely MOGGING with that GIGACHAD rank </>
                          ) : role.avg_quality_score >= 35 ? (
                            <>high key BASED at rank </>
                          ) : role.avg_quality_score >= 30 ? (
                            <>showing major vibes at rank </>
                          ) : role.avg_quality_score >= 25 ? (
                            <>putting in that work at rank </>
                          ) : role.avg_quality_score >= 20 ? (
                            <>getting started fr at rank </>
                          ) : (
                            <>early days but still at rank </>
                          )}
                          <span className="font-mono">#{role.quality_rank ?? 'N/A'}</span>
                          {(role.quality_rank ?? 999) <= 10 ? (
                            <> (TOP 10 NO CAP) </>
                          ) : (role.quality_rank ?? 999) <= 50 ? (
                            <> (TOP 50 FR FR) </>
                          ) : (role.quality_rank ?? 999) <= 100 ? (
                            <> (TOP 100 THO) </>
                          ) : (
                            <>  </>
                          )}
                          with a BASED score of <span className="font-mono text-theme">{role.avg_quality_score.toFixed(1)}</span>
                          {role.avg_quality_score >= 40 ? " (TOO BASED TO MEASURE FR FR) 🔥" : 
                           role.avg_quality_score >= 35 ? " (ACTUALLY INSANE) 🚀" : 
                           role.avg_quality_score >= 30 ? " (GOING CRAZY RN) 💪" :
                           role.avg_quality_score >= 25 ? " (GETTING THERE) 📈" :
                           role.avg_quality_score >= 20 ? " (JUST WARMING UP) 🌱" :
                           " (ROOM TO GROW) 🎯"}
                        </span>
                      </p>

                      {/* Recent Changes */}
                      {((role.additions ?? 0) > 0 || (role.removals ?? 0) > 0) && (
                        <p className="flex gap-2">
                          <span>{netChange > 0 ? '🎁' : '✂️'}</span>
                          <span>
                            {netChange > 0 ? (
                              <>Mods dropped some honey - blessed <span className="text-GNEON/80">+{formatNumber(netChange)}</span> anons with this role{(role.additions ?? 0) >= 100 && ' 🔥'}</>
                            ) : (
                              <>Ser pls - mods yoinked this role from <span className="text-RNEON/80">{formatNumber(Math.abs(netChange))}</span> Beras</>
                            )}
                          </span>
                        </p>
                      )}

                      {/* Attainability Status */}
                      <p className="flex gap-2">
                        <span>🎯</span>
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="whitespace-nowrap">Current status:</span>
                          <span className={cn(
                            "text-[8px] tracking-[0.7px] leading-[18px] px-2 py-0 rounded uppercase whitespace-nowrap",
                            role.attainability_type === "OPEN" ? "bg-GNEON/10 text-GNEON/80" : 
                            role.attainability_type === "CLOSED" ? "bg-RNEON/10 text-RNEON/80" : 
                            role.attainability_type === "RESTRICTED" ? "bg-[#FFA500]/10 text-[#FFA500]/80" : 
                            "bg-muted text-muted-foreground"
                          )}>
                            {role.attainability_type.toLowerCase()}
                          </span>
                          <span className="whitespace-nowrap">
                            {role.attainability_type === "OPEN" ? (
                              "- aping time ser! 🚀"
                            ) : role.attainability_type === "CLOSED" ? (
                              "- hibernating szn 🐻"
                            ) : role.attainability_type === "RESTRICTED" ? (
                              "- stay pawsome fren 💎"
                            ) : (
                              "- wen requirements? 🤔"
                            )}
                          </span>
                          <span className="text-muted-foreground/50 text-xs whitespace-nowrap">(unofficial)</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-4 sm:space-y-6 mt-8">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {/* Distribution Stats */}
                  <div className="p-4 sm:p-6 rounded-lg border bg-N930">
                    <div className="flex items-center justify-between mb-6">
                      <div className="font-medium">Role Size Reveal</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User weight="fill" className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-mono">{role.active_users.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex w-full max-w-[140px] flex-col justify-between space-y-2">
                        <div className="text-xs text-muted-foreground">Is It Huge or Smol? 🔍</div>
                        <div className="text-2xl sm:text-3xl font-mono tabular-nums leading-none">
                          {((role.active_users / role.total_active_users) * 100).toFixed(1)}%
                        </div>
                      </div>
                        <PercentageBar 
                          percentage={(role.active_users / role.total_active_users) * 200}
                          totalCount={role.total_active_users}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground/80">
                        {role.active_users.toLocaleString()} of the {role.total_active_users.toLocaleString()} active Beras are repping this role rn
                      </p>
                      {/* 14 Day Changes */}
                      {((role.additions ?? 0) > 0 || (role.removals ?? 0) > 0) && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-mono",
                          netChange > 0 ? "text-GNEON/80" : "text-RNEON/80"
                        )}>
                          {netChange > 0 ? (
                            <>
                              <ArrowUp weight="bold" className="w-3 h-3" />
                              <span>+{formatNumber(netChange)}</span>
                              {(role.additions ?? 0) >= 100 && <span>🔥</span>}
                            </>
                          ) : (
                            <>
                              <ArrowDown weight="bold" className="w-3 h-3" />
                              <span>-{formatNumber(Math.abs(netChange))}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div className="p-4 sm:p-6 rounded-lg border bg-N930">
                    <div className="flex items-center justify-between mb-6">
                      <div className="font-medium">Vibe Check</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Trophy weight="fill" className="w-3.5 h-3.5 text-theme" />
                        <span>Rank #{role.quality_rank}</span>
                        <span className="text-muted-foreground/50">of {role.total_roles}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex w-full max-w-[140px] flex-col justify-between space-y-2">
                        <div className="text-xs text-muted-foreground">BASED Level</div>
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

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground/80">
                        {tier.tooltip}
                      </p>
                    </div>
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
    </div>
  );

  return createPortal(
    content,
    document.body
  );
} 
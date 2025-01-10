import { cn } from "@/lib/utils";
import { GlossaryRole } from "../../types";
import { formatNumber } from "../utils";

interface RoleAnalysisProps {
  role: GlossaryRole;
}

export function RoleAnalysis({ role }: RoleAnalysisProps) {
  const additions = role.additions || 0;
  const removals = role.removals || 0;
  const netChange = additions - removals;

  return (
    <div>
      <div className="text-foreground font-medium mb-2">Role Analysis</div>
      <div className="text-muted-foreground space-y-2">
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
  );
} 
import { GlossaryRole } from "../types";

export function getQualityTier(score: number, badge: GlossaryRole["badge"], category: string, active_users: number) {
  // Calculate fire level (1-5)
  // Adjust the scaling to show all 5 bars for scores 40+
  const fires = Math.max(1, Math.min(5, Math.ceil(
    score >= 40 ? 5 :  // Always show 5 bars for 40+
    score >= 35 ? 4 :  // 4 bars for 35-39
    score >= 30 ? 3 :  // 3 bars for 30-34
    score >= 25 ? 2 :  // 2 bars for 25-29
    1                  // 1 bar for below 25
  )));

  // Base tooltip for single-member roles
  if (active_users <= 1) {
    return {
      fires: 1,
      color: "text-theme",
      tooltip: "no vibes detected → solo squad | zero energy 💀"
    };
  }

  // Get base tier message
  let baseMessage = "";
  if (score >= 40) {
    baseMessage = "GIGACHAD ENERGY → squad mogging the leaderboard rn 👑";
  } else if (score >= 35) {
    baseMessage = "HIGH KEY BASED → squad absolutely demolishing it fr 🔥";
  } else if (score >= 30) {
    baseMessage = "MAJOR VIBES → community going astronomical rn 📈";
  } else if (score >= 25) {
    baseMessage = "SOLID ENERGY → squad putting in that work ngl 🚀";
  } else if (score >= 20) {
    baseMessage = "GETTING STARTED → energy rising fr 🌱";
  } else {
    baseMessage = "EARLY DAYS → time to level up the grind 💪";
  }

  return {
    fires,
    color: "text-theme",
    tooltip: baseMessage
  };
} 
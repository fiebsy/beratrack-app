import { GlossaryRole } from "../types";

export function getQualityTier(score: number, badge: GlossaryRole["badge"], category: string) {
  // Get the fire level based on score (same for all roles)
  const getFireLevel = (score: number) => {
    if (score >= 40) return 5;
    if (score >= 30) return 4;
    if (score >= 20) return 3;
    if (score >= 10) return 2;
    return 1;
  };

  const fires = getFireLevel(score);

  // Special messaging for team/bot roles but same fire levels
  if (badge === 'TEAM' || category === 'Bot' || category === 'Moderator') {
    return {
      fires,
      color: "text-muted-foreground", // Muted color for team/bot roles
      tooltip: badge === 'TEAM' 
        ? "MOGGING THE LEADERBOARD fr fr (but they're team so it's kinda cheating ngl) 👑"
        : "BEEP BOOP DETECTED 🤖 (bots are too based to compete with)"
    };
  }

  // Regular scoring tiers based on weighted scores
  if (score >= 40) {
    return {
      fires,
      color: "text-theme",
      tooltip: "GIGACHAD ENERGY 🔥 These Beras are MOGGING the chat fr fr"
    };
  }
  
  if (score >= 30) {
    return {
      fires,
      color: "text-theme",
      tooltip: "MAJOR PLAYERS IN THE ECOSYSTEM 💪 Keeping the vibes consistently BASED"
    };
  }
  
  if (score >= 20) {
    return {
      fires,
      color: "text-theme",
      tooltip: "COMFY CHAT PRESENCE 🐻 Regular contributors keeping it real"
    };
  }

  if (score >= 10) {
    return {
      fires,
      color: "text-theme",
      tooltip: "WAGMI ENERGY 📈 Getting more active and building the vibe"
    };
  }

  return {
    fires,
    color: "text-theme",
    tooltip: "SMOL ACTIVITY 🌱 More about watching the action rn (still BASED tho)"
  };
} 
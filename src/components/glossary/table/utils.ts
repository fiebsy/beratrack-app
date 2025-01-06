import { GlossaryRole } from "../types";

export function getBadgeVariant(badge: GlossaryRole["badge"]) {
  switch (badge) {
    case "TEAM":
      return "destructive";
    case "NFT":
      return "secondary";
    case "COMMUNITY":
      return "default";
    case "SERVICE":
      return "outline";
    case "SYSTEM":
      return "theme";
    case "UNCLEAR":
      return "secondary";
    default:
      return "default";
  }
}

export function formatBadgeText(badge: string) {
  switch (badge) {
    case "NFT":
      return "NFT Holder";
    case "COMMUNITY":
      return "Community Role";
    case "SERVICE":
      return "Service Role";
    case "SYSTEM":
      return "System Role";
    case "TEAM":
      return "Team Role";
    case "UNCLEAR":
      return "Unspecified";
    default:
      return badge.charAt(0).toUpperCase() + badge.slice(1).toLowerCase() + " Role";
  }
} 
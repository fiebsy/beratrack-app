/**
 * This file defines all known Discord roles based on official-roles-list.json
 */

export type RoleCategory = 
  | "Team" 
  | "Moderator" 
  | "Helper" 
  | "NFT Holder" 
  | "Community" 
  | "System" 
  | "Bot"
  | "Governance"
  | "Unknown";

export interface KnownRole {
  name: string;
  category: RoleCategory;
  description: string;
  emoji?: string;
  subcategory?: string;
  aliases?: string[]; // Alternative names for the same role
}

// Helper function to create role objects
function createRole(
  name: string,
  category: RoleCategory,
  description: string,
  emoji?: string,
  subcategory?: string,
  aliases?: string[]
): KnownRole {
  return { name, category, description, emoji, subcategory, aliases };
}

// Define all known roles from official-roles-list.json
export const KNOWN_ROLES: KnownRole[] = [
  // Discord Management Roles from discord_roles
  createRole("Team", "Team", "Official team members.", "⛓️", "Team"),
  createRole("Admin", "Team", "Admin of the Discord server.", "🐼", "Team"),
  createRole("Mod Lead", "Moderator", "Moderators in charge of the team.", "🛂", "Team"),
  createRole("Mod", "Moderator", "Moderators of the server.", "🛂", "Team", ["Mod Perms"]),
  createRole("Bera Helper", "Helper", "Volunteers who assist the community.", "🪪", "Team", ["Bera Helper (they do it for free)", "Full Stack Helper"]),
  
  // System & Verification Roles from community_roles
  createRole(
    "%100 Real User",
    "System",
    "This shows that you have successfully passed the bot verification. You are either a BERA or a bot good enough to bypass the bot verification. Congrats.",
    undefined,
    "Verification",
    ["100% REAL USER", "Double Verified"]
  ),
  createRole(
    "Governance Pings",
    "Governance",
    "Receives pings for new governance proposals. Pings are currently disabled to avoid spam.",
    undefined,
    "Notification",
    ["Proposal Pings", "Proposals"]
  ),

  // Bot Roles
  createRole("MEE6", "Bot", "MEE6 Discord Bot", undefined, "Bot", ["MEE6_BOT"]),
  createRole("DYNO", "Bot", "DYNO Discord Bot", undefined, "Bot", ["DYNO_BOT"]),
  createRole("WICK", "Bot", "WICK Discord Bot", undefined, "Bot", ["WICK_BOT"]),

  // NFT Verification Roles from discord_roles
  createRole(
    "Verified OG Bong Bear Holder",
    "NFT Holder",
    "OG Bong Bear NFT holders.",
    "🧸",
    "Verified"
  ),
  createRole(
    "Verified Bear Holder - Any Collection",
    "NFT Holder",
    "Holders of any BERA NFTs.",
    "🐻",
    "Verified",
    ["I bought an NFT"]
  ),

  // NFT Collection Roles from nft_roles
  createRole("Original Gangster", "NFT Holder", "OG Bong Bear Holders", undefined, "NFT"),
  createRole("Bera", "NFT Holder", "Bear Holder - Any Collection", undefined, "NFT"),
  createRole("Jarred Up", "NFT Holder", "Honey Comb NFT Holders", undefined, "NFT"),
  createRole("YeeTARDED", "NFT Holder", "Yeetard NFT holders", undefined, "NFT"),
  createRole("Smilee Bera", "NFT Holder", "Smilee beras holders", undefined, "NFT"),
  createRole("HoneyPOTTED", "NFT Holder", "Honeygenesis holders", undefined, "NFT"),
  createRole("Junky URSA", "NFT Holder", "The proof of Junkie holders", undefined, "NFT"),
  createRole("Beratone FOUNDER'S Edition", "NFT Holder", "Sailcloth holders", undefined, "NFT"),
  createRole("BeraDROMER", "NFT Holder", "Tour de berance holders", undefined, "NFT"),
  createRole("Ramen Bera", "NFT Holder", "HungryBera holders", undefined, "NFT"),
  createRole("Beraborrower", "NFT Holder", "Big fat beras holders", undefined, "NFT"),
  createRole("Beramonium HOLDER", "NFT Holder", "Beramonium Chronicles: Genesis holders", undefined, "NFT"),
  createRole("Beradelic - BeraSig", "NFT Holder", "Beradelic holders", undefined, "NFT", ["Beradelic 💖 Beraji Bears"]),
  createRole("Berahorse Jockey", "NFT Holder", "Bera Horses holders", undefined, "NFT"),
  createRole("Berally Tripper", "NFT Holder", "Beracid holders", undefined, "NFT"),
  createRole("Memeswap Bruv", "NFT Holder", "Bruvvprint holders", undefined, "NFT"),
  createRole("BurrBear Printooor", "NFT Holder", "Holders of Berome Powell or Bearet Yellen NFTs", undefined, "NFT"),
  createRole("Fable Bera", "NFT Holder", "Fable beras holders", undefined, "NFT"),
  createRole("BeraPong House", "NFT Holder", "BeraPong Genesis holders", undefined, "NFT"),
  createRole("CubHUB'd", "NFT Holder", "CubHub holders", undefined, "NFT"),
  createRole("Onikuma Bera", "NFT Holder", "Onikuma Genesis NFT holders", undefined, "NFT"),
  createRole("Beracian", "NFT Holder", "Berac or BeracPoL holders", undefined, "NFT"),
  createRole("BeraBOY", "NFT Holder", "BERABOYZ holders", undefined, "NFT"),
  createRole("BeraPUNK", "NFT Holder", "Berapunk holders", undefined, "NFT"),
  createRole("BeraSwap", "NFT Holder", "BeraSwap holders", undefined, "NFT"),
  createRole("BeraPaw", "NFT Holder", "PawPal holders", undefined, "NFT"),
  createRole("BeraRoot", "NFT Holder", "BlueBeras holders", undefined, "NFT"),
  createRole("Holistic BERA", "NFT Holder", "NPC Beras holders", undefined, "NFT"),
  createRole("Narra Bera", "NFT Holder", "NarraZAI holders", undefined, "NFT"),
  createRole("Wizwoods Bera", "NFT Holder", "Chrono-Wizard Bear holders", undefined, "NFT"),
  createRole("Booga Bera", "NFT Holder", "Booga bera holders", undefined, "NFT"),
  createRole("Happee Bera", "NFT Holder", "Happee bera holders", undefined, "NFT"),
  createRole("PumpBera", "NFT Holder", "PumpBera holders", undefined, "NFT"),
  createRole("OasisOpus", "NFT Holder", "OasisOpus holders", undefined, "NFT"),
  createRole("Wagmibera", "NFT Holder", "WagmiBera holders", undefined, "NFT"),
  createRole("BeraDeluna-Beraji Bears", "NFT Holder", "Beradeluna holders", undefined, "NFT"),
  createRole("Satori", "NFT Holder", "Satori holders", undefined, "NFT"),
  createRole("Berautistics", "NFT Holder", "Berautistics holders", undefined, "NFT"),
  createRole("Pret's Bera", "NFT Holder", "Prets_Bera holders", undefined, "NFT"),
  createRole("Skemmy Bera", "NFT Holder", "Skemmy beras holders", undefined, "NFT"),
  createRole("Hornee Bera", "NFT Holder", "Hornee Beras holders", undefined, "NFT"),
  createRole("AZEx Bera", "NFT Holder", "AZEx Bear NFT holders", undefined, "NFT"),

  // Community Achievement Roles from community_roles
  createRole(
    "Bera Cub",
    "Community",
    "You can get this role by community engagement and contributions in discord. You are rising fast but you're still just a baby.",
    undefined,
    "Progress",
    ["Bera Clupe"]
  ),
  createRole(
    "Super Cub",
    "Community",
    "Advanced community engagement role",
    undefined,
    "Progress"
  ),
  createRole(
    "Bug Blaster",
    "Community",
    "This caterpillar means that you are actively supporting the testnet process and finding or trying to help some important bugs. Thanks.",
    undefined,
    "Achievement",
    ["Bera Bug BLASTER"]
  ),
  createRole(
    "Super Helper",
    "Community",
    "Wow. Everything helpers do, they do better. They don't complain, they produce solutions.",
    undefined,
    "Helper"
  ),
  createRole(
    "Helpful Opinion Leader",
    "Community",
    "Community members who make content, host events, and create art.",
    undefined,
    "Creator",
    [
      "Helpful Opinion Leader - ARTIST",
      "Helpful Opinion Leader - CONTENT",
      "Helpful Opinion Leader - COMMUNITY"
    ]
  ),

  // Special Community Roles from community_roles
  createRole(
    "Princess",
    "Community",
    "This role is for attention-seeking females. Your name'll look cooler pink. If you are a helpful, beautiful, and hot BERA, it is possible to get this. IDK ask to FW.",
    undefined,
    "Special"
  ),
  createRole(
    "I'm good at poker",
    "Community",
    "A special role for gambler BERAs. You won the poker tournament. Congrats.",
    undefined,
    "Achievement",
    ["Bera Poker Master", "I'm Good At Poker"]
  ),

  // Nothing Series from community_roles
  createRole(
    "Nothing",
    "Community",
    "Kind of nothing you can't get unless you're some of the BERA activities winner.",
    undefined,
    "Nothing",
    ["#1 Useless Role", "#2 Useless Role", "#3 Useless Role", "#3 Useless Discord Role", "Actually Useless Role", "Another Useless Discord Role"]
  ),
  createRole(
    "Actually Nothing",
    "Community",
    "Kind of nothing you can't get unless you're some of the BERA activities winner.",
    undefined,
    "Nothing"
  ),
  createRole(
    "Absolutely Nothing",
    "Community",
    "Kind of nothing you can't get unless you're some of the BERA activities winner.",
    undefined,
    "Nothing"
  ),
  createRole(
    "Truly Nothing",
    "Community",
    "There is no official information on this role.",
    undefined,
    "Nothing"
  ),
  createRole(
    "Certified Nothing",
    "Community",
    "There is no official information on this role.",
    undefined,
    "Nothing"
  ),
  createRole(
    "Nothing Premium+",
    "Community",
    "There is no official information on this role.",
    undefined,
    "Nothing"
  )
];

// Create a Map for fast role lookup including aliases
const KNOWN_ROLE_MAP = new Map<string, KnownRole>();
KNOWN_ROLES.forEach(role => {
  KNOWN_ROLE_MAP.set(role.name.toLowerCase(), role);
  role.aliases?.forEach(alias => {
    KNOWN_ROLE_MAP.set(alias.toLowerCase(), role);
  });
});

/**
 * Helper function to check if a role is known and get its information
 */
export function getKnownRole(roleName: string): KnownRole | undefined {
  return KNOWN_ROLE_MAP.get(roleName.toLowerCase());
}

/**
 * Helper function to check if a role exists in our official list
 */
export function isKnownRole(roleName: string): boolean {
  return KNOWN_ROLE_MAP.has(roleName.toLowerCase());
}

/**
 * Helper function to get a role's description
 * Returns "Purpose unknown" for unknown roles
 */
export function getRoleDescription(roleName: string): string {
  const role = getKnownRole(roleName);
  if (!role) return "Purpose unknown";
  return role.emoji ? `${role.description} ${role.emoji}` : role.description;
}

/**
 * Helper function to get a role's category
 * Returns "Unknown" for unknown roles
 */
export function getRoleCategory(roleName: string): RoleCategory {
  return getKnownRole(roleName)?.category || "Unknown";
}

/**
 * Helper function to get roles by category
 */
export function getRolesByCategory(category: RoleCategory): KnownRole[] {
  return KNOWN_ROLES.filter(role => role.category === category);
}

/**
 * Helper function to get roles by subcategory
 */
export function getRolesBySubcategory(subcategory: string): KnownRole[] {
  return KNOWN_ROLES.filter(role => role.subcategory === subcategory);
} 
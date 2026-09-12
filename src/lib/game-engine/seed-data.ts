export interface SeedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SeedShopItem {
  id: string;
  name: string;
  description: string;
  type: "AVATAR_FRAME" | "THEME" | "TITLE" | "BADGE";
  price: number;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  itemValue: string;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { id: "cat_study", name: "Knowledge & Study", icon: "BookOpen", color: "#3B82F6" },
  { id: "cat_fitness", name: "Fitness & Health", icon: "Dumbbell", color: "#EF4444" },
  { id: "cat_habit", name: "Focus & Discipline", icon: "Flame", color: "#8B5CF6" },
  { id: "cat_craft", name: "Craft & Code", icon: "Code", color: "#EC4899" },
  { id: "cat_vitality", name: "Vitality & Wellness", icon: "Heart", color: "#10B981" },
  { id: "cat_social", name: "Social & Community", icon: "Users", color: "#F97316" },
];

export const SEED_SHOP_ITEMS: SeedShopItem[] = [
  // Avatar Frames
  {
    id: "frame_iron",
    name: "Ironbound Crest",
    description: "A sturdy forged iron crest for hardened seekers of routine.",
    type: "AVATAR_FRAME",
    price: 50,
    icon: "🛡️",
    rarity: "COMMON",
    itemValue: "border-slate-500 shadow-sm",
  },
  {
    id: "frame_gold",
    name: "Gilded Coronet",
    description: "Radiant golden trim that signals disciplined triumph.",
    type: "AVATAR_FRAME",
    price: 150,
    icon: "👑",
    rarity: "RARE",
    itemValue: "border-amber-400 ring-2 ring-amber-400/50 shadow-rpg-gold",
  },
  {
    id: "frame_arcane",
    name: "Arcane Rift Frame",
    description: "A pulsating border infused with pure mana essence.",
    type: "AVATAR_FRAME",
    price: 300,
    icon: "🔮",
    rarity: "EPIC",
    itemValue: "border-sky-400 ring-2 ring-sky-400/60 shadow-rpg-glow",
  },
  {
    id: "frame_celestial",
    name: "Celestial Aurora",
    description: "Forged in the stars, shifting with cosmic brilliance.",
    type: "AVATAR_FRAME",
    price: 600,
    icon: "✨",
    rarity: "LEGENDARY",
    itemValue: "border-purple-400 ring-4 ring-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.6)]",
  },

  // Titles
  {
    id: "title_novice",
    name: "The Novice Adventurer",
    description: "Every legendary hero started on page one.",
    type: "TITLE",
    price: 40,
    icon: "🌱",
    rarity: "COMMON",
    itemValue: "The Novice Adventurer",
  },
  {
    id: "title_grinder",
    name: "The Relentless",
    description: "Awarded to those who show up day after day without fail.",
    type: "TITLE",
    price: 120,
    icon: "⚡",
    rarity: "RARE",
    itemValue: "The Relentless",
  },
  {
    id: "title_archmage",
    name: "Grand Archmage of Will",
    description: "Master of intellect, deep focus, and high productivity.",
    type: "TITLE",
    price: 350,
    icon: "📜",
    rarity: "EPIC",
    itemValue: "Grand Archmage of Will",
  },
  {
    id: "title_sovereign",
    name: "Sovereign of Destinies",
    description: "Commands absolute control over every hour of the day.",
    type: "TITLE",
    price: 750,
    icon: "🌟",
    rarity: "LEGENDARY",
    itemValue: "Sovereign of Destinies",
  },

  // Themes
  {
    id: "theme_obsidian",
    name: "Obsidian Void",
    description: "Deep stealth midnight theme with high contrast markers.",
    type: "THEME",
    price: 100,
    icon: "🌑",
    rarity: "COMMON",
    itemValue: "theme-obsidian",
  },
  {
    id: "theme_arcane",
    name: "Arcane Sanctum",
    description: "Luminescent azure and deep cobalt aesthetic.",
    type: "THEME",
    price: 250,
    icon: "🔷",
    rarity: "RARE",
    itemValue: "theme-arcane",
  },
  {
    id: "theme_emerald",
    name: "Verdant Grove",
    description: "Forest emerald hues invoking vitality and calm endurance.",
    type: "THEME",
    price: 250,
    icon: "🍃",
    rarity: "RARE",
    itemValue: "theme-emerald",
  },
  {
    id: "theme_solar",
    name: "Solar Citadel",
    description: "A radiant amber parchment theme for daytime warriors.",
    type: "THEME",
    price: 400,
    icon: "☀️",
    rarity: "EPIC",
    itemValue: "theme-solar",
  },

  // Badges
  {
    id: "badge_dawn",
    name: "Dawn Crusader Crest",
    description: "Emblem of heroes who conquer before the morning bells.",
    type: "BADGE",
    price: 80,
    icon: "🌅",
    rarity: "RARE",
    itemValue: "badge-dawn",
  },
  {
    id: "badge_flame",
    name: "Eternal Flame Pin",
    description: "Symbol of unwavering continuity and unbroken streaks.",
    type: "BADGE",
    price: 200,
    icon: "🔥",
    rarity: "EPIC",
    itemValue: "badge-flame",
  },
];

export const STARTER_QUESTS = [
  {
    title: "Complete 45 Minutes of Deep Work / Study",
    description: "Focus without distractions on a core task or learning module.",
    category: "Knowledge & Study",
    difficulty: "MEDIUM" as const,
    attributeType: "INTELLECT" as const,
    estimatedMinutes: 45,
    repeatType: "DAILY" as const,
  },
  {
    title: "30-Minute Physical Conditioning or Gym",
    description: "Hit the weights, go for a run, or complete a home workout.",
    category: "Fitness & Health",
    difficulty: "MEDIUM" as const,
    attributeType: "STRENGTH" as const,
    estimatedMinutes: 30,
    repeatType: "DAILY" as const,
  },
  {
    title: "Hydration Protocol: Drink 2L of Water",
    description: "Keep your energy reserves peaked with adequate hydration.",
    category: "Vitality & Wellness",
    difficulty: "EASY" as const,
    attributeType: "VITALITY" as const,
    estimatedMinutes: 5,
    repeatType: "DAILY" as const,
  },
  {
    title: "Evening Reflection & Tomorrow's Plan",
    description: "Review today's accomplishments and set tomorrow's priorities.",
    category: "Focus & Discipline",
    difficulty: "EASY" as const,
    attributeType: "DISCIPLINE" as const,
    estimatedMinutes: 10,
    repeatType: "DAILY" as const,
  },
];

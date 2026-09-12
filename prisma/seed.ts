import { PrismaClient } from "@prisma/client";
import { SEED_CATEGORIES, SEED_SHOP_ITEMS } from "../src/lib/game-engine/seed-data";
import { ACHIEVEMENTS } from "../src/lib/game-engine/achievements";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Life RPG catalog data...");

  // Seed Categories
  for (const cat of SEED_CATEGORIES) {
    await prisma.questCategory.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, color: cat.color },
      create: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_CATEGORIES.length} quest categories`);

  // Seed Shop Items
  for (const item of SEED_SHOP_ITEMS) {
    await prisma.shopItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        type: item.type,
        price: item.price,
        icon: item.icon,
        rarity: item.rarity,
        itemValue: item.itemValue,
      },
      create: {
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        price: item.price,
        icon: item.icon,
        rarity: item.rarity,
        itemValue: item.itemValue,
        isAvailable: true,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_SHOP_ITEMS.length} shop items`);

  // Seed Achievements
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        rewardXp: ach.rewardXp,
        rewardGold: ach.rewardGold,
      },
      create: {
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        rewardXp: ach.rewardXp,
        rewardGold: ach.rewardGold,
      },
    });
  }
  console.log(`✓ Seeded ${ACHIEVEMENTS.length} achievement definitions`);

  console.log("✨ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

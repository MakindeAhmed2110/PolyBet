import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  const categories = [
    {
      name: "crypto",
      description: "Cryptocurrency and blockchain related predictions",
      icon: "",
    },
    {
      name: "sports",
      description: "Sports events, matches, and competitions",
      icon: "",
    },
    {
      name: "politics",
      description: "Political events, elections, and policy decisions",
      icon: "",
    },
    {
      name: "tech",
      description: "Technology, AI, and innovation predictions",
      icon: "",
    },
    {
      name: "economics",
      description: "Economic indicators, market trends, and financial events",
      icon: "",
    },
    {
      name: "weather",
      description: "Weather patterns and climate events",
      icon: "",
    },
    {
      name: "entertainment",
      description: "Movies, TV shows, music, and entertainment industry",
      icon: "",
    },
    {
      name: "science",
      description: "Scientific discoveries, research, and breakthroughs",
      icon: "",
    },
    {
      name: "other",
      description: "Miscellaneous predictions that don't fit other categories",
      icon: "",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`✅ Created/updated category: ${category.name}`);
  }

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch(e => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

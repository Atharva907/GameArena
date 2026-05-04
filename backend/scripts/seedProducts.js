import { connectPostgres, disconnectPostgres, prisma } from "../src/lib/postgres.js";

async function seedProducts() {
  try {
    await connectPostgres();

    const categorySeed = [
      {
        name: "Gaming Gear",
        description: "Gaming peripherals and accessories",
        isFeatured: true,
      },
      {
        name: "Merchandise",
        description: "GameArena apparel and branded merchandise",
        isFeatured: false,
      },
      {
        name: "Digital Items",
        description: "Digital bundles and game-related items",
        isFeatured: false,
      },
    ];

    for (const category of categorySeed) {
      await prisma.category.upsert({
        where: { name: category.name },
        create: category,
        update: category,
      });
    }

    const categories = await prisma.category.findMany({
      where: { name: { in: categorySeed.map((category) => category.name) } },
    });
    const categoryMap = new Map(
      categories.map((category) => [category.name, category.id]),
    );

    await prisma.product.deleteMany({});
    await prisma.product.createMany({
      data: [
        {
          name: "Professional Gaming Mouse",
          description:
            "High-precision gaming mouse with RGB lighting and customizable DPI.",
          price: 80,
          categoryId: categoryMap.get("Gaming Gear"),
          image: "/assets/images/games/valorant2.jpg",
          inStock: 50,
          isFeatured: true,
        },
        {
          name: "Gaming Headset Pro",
          description:
            "Surround-sound gaming headset with a noise-cancelling microphone.",
          price: 130,
          categoryId: categoryMap.get("Gaming Gear"),
          image: "/assets/images/games/cod.jpg",
          inStock: 30,
          isFeatured: true,
        },
        {
          name: "Team Jersey",
          description: "Official GameArena jersey for tournament participants.",
          price: 60,
          categoryId: categoryMap.get("Merchandise"),
          image: "/assets/images/GameArenaLogo.png",
          inStock: 100,
          isFeatured: false,
        },
        {
          name: "Digital Game Pack",
          description: "A starter digital bundle for esports players.",
          price: 30,
          categoryId: categoryMap.get("Digital Items"),
          image: "/assets/images/games/bgmi2.jpg",
          inStock: 999,
          isFeatured: false,
        },
      ],
    });

    console.log("Product seed completed.");
  } catch (error) {
    console.error("Product seed failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectPostgres();
  }
}

seedProducts();

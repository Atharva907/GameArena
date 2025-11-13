import { connectDB } from '../lib/databaseConnection';
import Product from '../models/Product';

async function seedProducts() {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});

    // Sample products
    const products = [
      {
        name: "Professional Gaming Mouse",
        description: "High-precision gaming mouse with RGB lighting and customizable DPI settings",
        price: 79.99,
        category: "gaming-gear",
        image: "https://example.com/mouse.jpg",
        inStock: 50,
        isFeatured: true
      },
      {
        name: "Gaming Headset Pro",
        description: "7.1 surround sound gaming headset with noise-cancelling microphone",
        price: 129.99,
        category: "gaming-gear",
        image: "https://example.com/headset.jpg",
        inStock: 30,
        isFeatured: true
      },
      {
        name: "Team Jersey",
        description: "Official team jersey with player name and number",
        price: 59.99,
        category: "merchandise",
        image: "https://example.com/jersey.jpg",
        inStock: 100,
        isFeatured: false
      },
      {
        name: "Gaming Keyboard RGB",
        description: "Mechanical gaming keyboard with per-key RGB backlighting",
        price: 149.99,
        category: "gaming-gear",
        image: "https://example.com/keyboard.jpg",
        inStock: 25,
        isFeatured: true
      },
      {
        name: "Digital Game Pack",
        description: "Bundle of 5 popular indie games",
        price: 29.99,
        category: "digital-items",
        image: "https://example.com/games.jpg",
        inStock: 999,
        isFeatured: false
      }
    ];

    // Insert products
    await Product.insertMany(products);
    console.log('Products seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();

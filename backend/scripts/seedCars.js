// backend/scripts/seedCars.js
import mongoose from "mongoose";
import { connectDB, closeDB } from "../src/config/db.js";
import Car from "../src/models/Car.js";
import User from "../src/models/User.js";

const premiumCars = [
  {
    brand: "Mercedes-Benz",
    model: "S-Class",
    year: 2024,
    category: "luxury",
    dailyPrice: 450,
    transmission: "automatic",
    fuel: "petrol",
    seating: 5,
    description: "The Mercedes-Benz S-Class is the absolute pinnacle of luxury motoring. It features an executive rear cabin, active ambient lighting, and a whisper-quiet ride.",
    features: ["Massage Seats", "Burmester 4D Audio", "Night Vision Assist", "Panoramic Sunroof"],
    pickupLocations: ["Lahore", "Karachi"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200&auto=format&fit=crop"
    ],
  },
  {
    brand: "Porsche",
    model: "911 Carrera",
    year: 2024,
    category: "sports",
    dailyPrice: 650,
    transmission: "automatic",
    fuel: "petrol",
    seating: 4,
    description: "The Porsche 911 Carrera is the benchmark for sports cars. With its iconic silhouette, rear-engine layout, and razor-sharp handling, it delivers a pure, unfiltered driving experience.",
    features: ["Sport Chrono Package", "Bose Surround Sound", "Adaptive Sport Seats"],
    pickupLocations: ["Lahore"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop"
    ],
  },
  {
    brand: "Ferrari",
    model: "F8 Tributo",
    year: 2023,
    category: "sports",
    dailyPrice: 950,
    transmission: "automatic",
    fuel: "petrol",
    seating: 2,
    description: "The Ferrari F8 Tributo is a celebration of excellence. It features the most powerful V8 engine ever built by Ferrari, combined with a chassis that delivers unparalleled agility.",
    features: ["Twin-Turbo V8", "Carbon Fiber Racing Seats", "Advanced Aerodynamics"],
    pickupLocations: ["Karachi", "Islamabad"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1200&auto=format&fit=crop"
    ],
  },
  {
    brand: "Tesla",
    model: "Model S Plaid",
    year: 2024,
    category: "electric",
    dailyPrice: 400,
    transmission: "automatic",
    fuel: "electric",
    seating: 5,
    description: "Silent speed. The Tesla Model S Plaid is the fastest production electric car, offering 1,020 horsepower and an interior dominated by a 17-inch cinematic display.",
    features: ["Autopilot", "Full Self-Driving", "Glass Roof"],
    pickupLocations: ["Lahore"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=1200&auto=format&fit=crop"
    ],
  },
  {
    brand: "Range Rover",
    model: "Autobiography",
    year: 2023,
    category: "suv",
    dailyPrice: 500,
    transmission: "automatic",
    fuel: "petrol",
    seating: 5,
    description: "Command the road in the Range Rover Autobiography. Combining unrivalled off-road capability with supreme luxury.",
    features: ["Air Suspension", "Meridian Audio", "Terrain Response 2"],
    pickupLocations: ["Islamabad"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop"
    ],
  },
  {
    brand: "Audi",
    model: "A8 L",
    year: 2024,
    category: "sedan",
    dailyPrice: 420,
    transmission: "automatic",
    fuel: "hybrid",
    seating: 5,
    description: "Quiet luxury and advanced technology. The Audi A8 L is the flagship sedan.",
    features: ["Predictive Active Suspension", "Bang & Olufsen 3D Audio", "Rear Wheel Steering"],
    pickupLocations: ["Lahore"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop"
    ],
  },
];

async function run() {
  try {
    await connectDB();
    const admin = await User.findOne({ role: "admin" });
    await Car.deleteMany({});
    const carsWithAdmin = premiumCars.map(car => ({ ...car, createdBy: admin._id, ratingAverage: 4.8, ratingCount: 24 }));
    await Car.insertMany(carsWithAdmin);
    console.log(`Successfully seeded ${premiumCars.length} premium cars!`);
  } catch (err) {
    console.error("Failed to seed:", err.message);
  } finally {
    await closeDB();
    await mongoose.disconnect().catch(() => {});
    process.exit();
  }
}
run();
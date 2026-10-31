// SAMPLE DATA ONLY — placeholder products, prices and stock.
// These are NOT real Gaz Gaz Soukra prices or inventory. Replace with the database later.
import brakes from "@/assets/cat-brakes.jpg";
import engine from "@/assets/cat-engine.jpg";
import transmission from "@/assets/cat-transmission.jpg";

export type CategoryId = "engine" | "brakes" | "transmission" | "accessories";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  brand: string;
  compatibility: string;
  price: number; // TND, sample
  stock: number; // sample
  image: string;
  description: string;
  featured?: boolean;
}

export const categories: Category[] = [
  { id: "engine", name: "Engine", description: "Pistons, plugs, filters", image: engine },
  { id: "brakes", name: "Brakes", description: "Discs, pads, calipers", image: brakes },
  { id: "transmission", name: "Transmission", description: "Chains, sprockets, clutch", image: transmission },
  { id: "accessories", name: "Gear & Accessories", description: "Helmets, mirrors, care", image: transmission },
];

export const sampleProducts: Product[] = [
  { id: "p-001", name: "Sample Piston Kit 50cc", category: "engine", brand: "Sample Brand", compatibility: "50cc scooters (example)", price: 85, stock: 12, image: engine, description: "Placeholder piston kit with rings, pin and clips. Specs shown are examples only.", featured: true },
  { id: "p-002", name: "Sample Spark Plug", category: "engine", brand: "Sample Brand", compatibility: "Most 4-stroke engines (example)", price: 18, stock: 40, image: engine, description: "Placeholder spark plug listing for demonstration." },
  { id: "p-003", name: "Sample Air Filter", category: "engine", brand: "Sample Brand", compatibility: "125cc models (example)", price: 45, stock: 0, image: engine, description: "Placeholder washable air filter listing." },
  { id: "p-004", name: "Sample Front Brake Disc", category: "brakes", brand: "Sample Brand", compatibility: "Sport 600cc (example)", price: 220, stock: 5, image: brakes, description: "Placeholder floating brake disc, drilled pattern.", featured: true },
  { id: "p-005", name: "Sample Brake Pads Set", category: "brakes", brand: "Sample Brand", compatibility: "Universal fit (example)", price: 55, stock: 25, image: brakes, description: "Placeholder sintered brake pad set." },
  { id: "p-006", name: "Sample 4-Piston Caliper", category: "brakes", brand: "Sample Brand", compatibility: "Radial mount (example)", price: 390, stock: 2, image: brakes, description: "Placeholder radial brake caliper listing.", featured: true },
  { id: "p-007", name: "Sample Chain Kit 428", category: "transmission", brand: "Sample Brand", compatibility: "125cc (example)", price: 120, stock: 9, image: transmission, description: "Placeholder chain + sprocket kit.", featured: true },
  { id: "p-008", name: "Sample Rear Sprocket 42T", category: "transmission", brand: "Sample Brand", compatibility: "Example fitment", price: 60, stock: 14, image: transmission, description: "Placeholder steel rear sprocket." },
  { id: "p-009", name: "Sample Full-Face Helmet", category: "accessories", brand: "Sample Brand", compatibility: "Sizes S–XL (example)", price: 260, stock: 6, image: transmission, description: "Placeholder matte-black full-face helmet." },
  { id: "p-010", name: "Sample Chain Lube Spray", category: "accessories", brand: "Sample Brand", compatibility: "All chains", price: 25, stock: 30, image: transmission, description: "Placeholder chain lubricant listing." },
];

export const formatPrice = (n: number) => `${n.toFixed(3).replace(".", ",")} TND`;

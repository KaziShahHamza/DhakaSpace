import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listing } from "./models/Listing";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dhakaspace";

const sampleListings = [
  // Homes
  {
    title: "Luxury 3-Bed Lakeview Apartment in Gulshan 2",
    category: "home",
    area: "Gulshan",
    address: "Road 86, Gulshan 2, Dhaka",
    rentBdt: 145000,
    advanceMonths: 4,
    sizeSqft: 2400,
    bedrooms: 3,
    floor: "7th Floor",
    amenities: [
      "Full Power Backup Generator",
      "2 Dedicated Parking Slots",
      "24/7 Security & CCTV",
      "LPG Pipeline Gas",
      "Gym & Rooftop Garden",
    ],
    description:
      "Spacious South-facing 3-bedroom apartment with panoramic lake view, servant room with attached bath, modern kitchen fittings, and 2 designated parking spaces.",
    contactName: "Tanvir Chowdhury",
    contactPhone: "+8801711002233",
    available: true,
  },
  {
    title: "Peaceful 3-Bed Family Flat Near Dhanmondi Lake",
    category: "home",
    area: "Dhanmondi",
    address: "Road 7/A, Dhanmondi, Dhaka",
    rentBdt: 58000,
    advanceMonths: 2,
    sizeSqft: 1550,
    bedrooms: 3,
    floor: "4th Floor",
    amenities: [
      "Elevator",
      "Titas Gas Line",
      "Generator Backup (Lift & Fans)",
      "1 Car Parking",
      "CCTV Monitoring",
    ],
    description:
      "Ideal residential apartment for families near premier schools and Dhanmondi Lake. Well-ventilated rooms, 3 balconies, active Titas pipeline gas connection.",
    contactName: "Nusrat Jahan",
    contactPhone: "+8801819223344",
    available: true,
  },
  {
    title: "Affordable 2-Bed Flat Near Mirpur 10 Metro Station",
    category: "home",
    area: "Mirpur",
    address: "Block C, Mirpur 10, Dhaka",
    rentBdt: 24000,
    advanceMonths: 2,
    sizeSqft: 1050,
    bedrooms: 2,
    floor: "3rd Floor",
    amenities: [
      "Lift",
      "Generator for Lift & Lights",
      "24-Hour Guard",
      "Bike Parking",
    ],
    description:
      "Bright 2-bed apartment 3 minutes walking distance from Mirpur 10 MRT Metro station. Convenient commute to Motijheel and Uttara. Family or small working team.",
    contactName: "Rafiqul Islam",
    contactPhone: "+8801912334455",
    available: true,
  },

  // Offices
  {
    title: "Modern Boutique Office Floor on Banani Road 11",
    category: "office",
    area: "Banani",
    address: "Road 11, Block D, Banani, Dhaka",
    rentBdt: 180000,
    advanceMonths: 4,
    sizeSqft: 1800,
    floor: "5th Floor",
    amenities: [
      "100% Full Generator Auto-Sync",
      "Dual High-Speed Elevators",
      "Central VRF Air Conditioning",
      "Fire Safety Clearance Certificate",
      "3 Basement Parking Slots",
    ],
    description:
      "Premium commercial floor plate situated directly on Banani Road 11 commercial strip. Ideal for software agencies, MNC liaison offices, or boutique consultancies.",
    contactName: "Mahmud Hasan",
    contactPhone: "+8801715998877",
    available: true,
  },
  {
    title: "Corporate Banking & Financial Suite in Motijheel C/A",
    category: "office",
    area: "Motijheel",
    address: "Dilkusha Commercial Area, Motijheel, Dhaka",
    rentBdt: 210000,
    advanceMonths: 6,
    sizeSqft: 2500,
    floor: "11th Floor",
    amenities: [
      "Uninterrupted 24/7 Power Backup",
      "3 Passenger Lifts + 1 Service Lift",
      "Commercial Holding / Trade License Approved",
      "24/7 Armed Security Guard",
    ],
    description:
      "Prestigious office space in Dhaka's historic commercial hub. High ceiling, open floor design suitable for banks, insurance, legal chambers, or financial brokerages.",
    contactName: "Kamal Uddin",
    contactPhone: "+8801817554433",
    available: true,
  },
  {
    title: "Modern Tech Startup Workspace in Uttara Sector 3",
    category: "office",
    area: "Uttara",
    address: "Sector 3, Jasimuddin Avenue, Uttara, Dhaka",
    rentBdt: 75000,
    advanceMonths: 3,
    sizeSqft: 1300,
    floor: "3rd Floor",
    amenities: [
      "High-Speed Fiber Internet Ready",
      "Full Power Backup Generator",
      "Elevator",
      "Airport Road Accessibility",
    ],
    description:
      "Fully functional commercial office close to Dhaka Airport and Uttara North metro station. Fitted with conference room partitions, pantry, and server room.",
    contactName: "Farhan Ahmed",
    contactPhone: "+8801611889900",
    available: true,
  },

  // Shops
  {
    title: "High-Footfall Corner Showroom in Gulshan 1 DCC Market",
    category: "shop",
    area: "Gulshan",
    address: "Gulshan 1 Circle, Dhaka",
    rentBdt: 220000,
    advanceMonths: 6,
    sizeSqft: 850,
    floor: "Ground Floor",
    amenities: [
      "Main Road Frontage Glass Facade",
      "24/7 Market Security",
      "Central AC Backup",
      "Commercial Utility Meter",
    ],
    description:
      "Prime ground-floor retail space with wide glass facade on busy Gulshan 1 junction. Exceptional visibility for fashion labels, electronics flagship, or lifestyle brands.",
    contactName: "Shahidul Alam",
    contactPhone: "+8801712445566",
    available: true,
  },
  {
    title: "Trendy Boutique Retail Shop on Dhanmondi Road 27",
    category: "shop",
    area: "Dhanmondi",
    address: "Old 27 (Shimanto Square area), Dhanmondi, Dhaka",
    rentBdt: 95000,
    advanceMonths: 3,
    sizeSqft: 650,
    floor: "1st Floor",
    amenities: [
      "Escalator & Lift Access",
      "Full Shopping Center Generator",
      "Customer Parking Plaza",
      "Trade License Eligible",
    ],
    description:
      "Charming shop unit in a well-frequented Dhanmondi commercial shopping plaza. Perfect for jewelry, cosmetics, clothing boutique, or gadget accessories.",
    contactName: "Sabrina Karim",
    contactPhone: "+8801918776655",
    available: true,
  },
  {
    title: "Commercial Retail Storefront in Mirpur 2 Shopping Hub",
    category: "shop",
    area: "Mirpur",
    address: "Stadium Road, Mirpur 2, Dhaka",
    rentBdt: 42000,
    advanceMonths: 3,
    sizeSqft: 500,
    floor: "Ground Floor",
    amenities: [
      "Road-Facing Shutter",
      "Individual Electricity Sub-Meter",
      "Night Guard Patrol",
      "Dense Pedestrian Traffic",
    ],
    description:
      "High pedestrian volume retail shop near Mirpur Stadium and colleges. Great spot for pharmacy, bookshop, mobile servicing, or confectionery shop.",
    contactName: "Zahid Hossain",
    contactPhone: "+8801552334411",
    available: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB. Clearing existing listings...");

    await Listing.deleteMany({});
    console.log("Inserting sample Dhaka rental listings...");
    const created = await Listing.insertMany(sampleListings);
    console.log(`✅ Successfully seeded ${created.length} Dhaka listings!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();

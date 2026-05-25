// Rakhi singles
import rakhiPeacock from "@/assets/rakhi/single/IMG_20260419_094121.jpg";
import rakhiRudraksh from "@/assets/rakhi/single/IMG_20260419_094750.jpg";
import rakhiElephant from "@/assets/rakhi/single/IMG_20260419_095609.jpg";
import rakhiGanesh from "@/assets/rakhi/single/IMG_20260419_095914.jpg";
import rakhiPearl from "@/assets/rakhi/single/IMG_20260419_100137.jpg";
import rakhiKundan from "@/assets/rakhi/single/IMG_20260419_100420.jpg";
import rakhiBracelet from "@/assets/rakhi/single/IMG_20260419_101513.jpg";
import rakhiLumba from "@/assets/rakhi/single/IMG_20260419_102233.jpg";
import rakhiOmSacred from "@/assets/rakhi/single/om-sacred-name.jpg";

// Combos
import combo1 from "@/assets/rakhi/combos/Combo_1.jpg";
import combo3 from "@/assets/rakhi/combos/Combo_3.jpg";
import combo5 from "@/assets/rakhi/combos/Combo_5.jpg";
import combo7 from "@/assets/rakhi/combos/Combo_7.jpg";
import combo9 from "@/assets/rakhi/combos/Combo_9.jpg";
import combo11 from "@/assets/rakhi/combos/Combo_11.jpg";

export type Product = {
  id: string;
  slug: string;
  name: string;
  series: string;
  category: string;
  priceNum: number;
  mrp?: number;
  img: string;
  badge?: string | null;
  description?: string;
  materials?: string;
  craftType?: string;
  suitableFor?: string;
  dimensions?: string;
  pieces?: number;
  deliveryDays?: number;
};

export const featuredRakhis: Product[] = [
  {
    id: "r1", slug: "mor-pankh-peacock",
    name: "Mor Pankh Peacock Rakhi", series: "Designer", category: "Designer",
    priceNum: 249, mrp: 299, img: rakhiPeacock, badge: "Bestseller",
    description: "Hand-painted peacock feather motif in vibrant teal and gold. Festive silk thread with an ornate brass frame — a true showstopper on your brother's wrist.",
    materials: "Brass frame, silk thread, enamel paint",
    craftType: "Hand-painted enamel",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r2", slug: "peacock-designer",
    name: "Peacock Designer Rakhi", series: "Designer", category: "Designer",
    priceNum: 199, img: rakhiRudraksh,
    description: "Elegant peacock-inspired motif on a beaded thread with gold-toned metalwork. Graceful, festive and timelessly beautiful.",
    materials: "Metal alloy, beaded thread",
    craftType: "Cast metalwork",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r3", slug: "om-sacred-name",
    name: "Om Sacred Name Rakhi", series: "Spiritual", category: "Spiritual",
    priceNum: 179, img: rakhiOmSacred, badge: "New",
    description: "Sacred 'Om' symbol in gold on a maroon velvet band. A blessing on your brother's wrist — comes with a handwritten blessings card.",
    materials: "Velvet band, gold-toned metal charm",
    craftType: "Metal stamping",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r4", slug: "royal-elephant-brass",
    name: "Royal Elephant Brass Rakhi", series: "Heritage", category: "Designer",
    priceNum: 299, mrp: 349, img: rakhiElephant,
    description: "Intricately carved brass elephant charm — symbol of wisdom and good fortune. Heritage-style craftsmanship on a deep red silk thread.",
    materials: "Solid brass, silk thread",
    craftType: "Handcrafted brass casting",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r5", slug: "ganesh-ji-blessing",
    name: "Ganesh Ji Blessing Rakhi", series: "Devotional", category: "Spiritual",
    priceNum: 229, img: rakhiGanesh,
    description: "Divine Ganesh idol in golden resin on a sacred red-gold thread. A blessed start to every new chapter — perfect for the devoted brother.",
    materials: "Resin idol, polyester thread with gold zari",
    craftType: "Hand-cast resin",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r6", slug: "pearl-kundan",
    name: "Pearl & Kundan Rakhi", series: "Premium", category: "Designer",
    priceNum: 349, mrp: 449, img: rakhiPearl, badge: "Premium",
    description: "Premium freshwater pearl centre with layered Kundan stone setting. Bridal-grade craftsmanship on a soft silk thread — for the brother who deserves the finest.",
    materials: "Freshwater pearl, Kundan stones, silk thread",
    craftType: "Kundan setting",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r7", slug: "royal-kundan-stone",
    name: "Royal Kundan Stone Rakhi", series: "Premium", category: "Designer",
    priceNum: 399, mrp: 499, img: rakhiKundan,
    description: "Layered Kundan stonework in deep reds and antique golds on a rich velvet band. Regal, opulent and unforgettable.",
    materials: "Kundan stones, velvet band, antique gold setting",
    craftType: "Traditional Kundan setting",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r8", slug: "velvet-bracelet",
    name: "Velvet Bracelet Rakhi", series: "Modern", category: "Designer",
    priceNum: 279, img: rakhiBracelet,
    description: "Contemporary velvet band with a silver-toned charm. Where modern style meets traditional spirit — perfect for the stylish, trend-forward brother.",
    materials: "Velvet band, silver-toned alloy charm",
    craftType: "Contemporary jewellery",
    suitableFor: "Brother",
    deliveryDays: 5,
  },
  {
    id: "r9", slug: "bhaiya-bhabhi-lumba-set",
    name: "Bhaiya Bhabhi Lumba Set", series: "Bhaiya Bhabhi", category: "Bhaiya Bhabhi",
    priceNum: 329, img: rakhiLumba,
    description: "A matched pair — a bold rakhi for bhaiya and a delicate golden lumba for bhabhi. Beautifully presented together in a gift box.",
    materials: "Metal alloy, zari thread, velvet gift box",
    craftType: "Jewellery-grade metalwork",
    suitableFor: "Brother & Bhabhi",
    pieces: 2,
    deliveryDays: 5,
  },
];

export const comboSets: Product[] = [
  {
    id: "c1", slug: "brothers-trio-set",
    name: "Brothers' Trio Set", series: "3 Rakhis", category: "Combo",
    priceNum: 549, mrp: 699, img: combo1,
    description: "Three handpicked rakhis — Designer, Spiritual and Heritage — one each for three brothers. Thoughtfully curated and beautifully boxed.",
    suitableFor: "3 Brothers", pieces: 3, deliveryDays: 5,
  },
  {
    id: "c2", slug: "family-bond-pack",
    name: "Family Bond Pack", series: "5 Rakhis", category: "Combo",
    priceNum: 849, mrp: 1049, img: combo3,
    description: "Five rakhis for the full brother circle. A curated mix of Designer and Spiritual styles — one pack, everyone covered.",
    suitableFor: "5 Brothers", pieces: 5, deliveryDays: 5,
  },
  {
    id: "c3", slug: "bhaiya-bhabhi-combo",
    name: "Bhaiya Bhabhi Lumba Set", series: "2 Rakhis", category: "Combo",
    priceNum: 449, img: combo5,
    description: "The classic duo — a premium rakhi for bhaiya and a matching lumba for bhabhi, together in a beautiful gift box.",
    suitableFor: "Brother & Bhabhi", pieces: 2, deliveryDays: 5,
  },
  {
    id: "c4", slug: "kids-cartoon-combo",
    name: "Kids Cartoon Combo", series: "4 Rakhis", category: "Combo",
    priceNum: 399, img: combo7,
    description: "Four bright, fun rakhis for the little brothers. Cartoon-themed, kid-safe and absolutely adorable.",
    suitableFor: "Kids (Brothers)", pieces: 4, deliveryDays: 5,
  },
  {
    id: "c5", slug: "premium-kundan-duo",
    name: "Premium Kundan Duo", series: "2 Rakhis", category: "Combo",
    priceNum: 599, mrp: 749, img: combo9,
    description: "Two showstopper Kundan rakhis for brothers who appreciate the finer things in life. Opulent, paired, and gift-ready.",
    suitableFor: "2 Brothers", pieces: 2, deliveryDays: 5,
  },
  {
    id: "c6", slug: "festive-big-family-pack",
    name: "Festive Big Family Pack", series: "7 Rakhis", category: "Combo",
    priceNum: 1099, mrp: 1399, img: combo11,
    description: "Seven rakhis for the big family reunion. Our most complete curated set — every style, every brother, one box.",
    suitableFor: "7 Brothers", pieces: 7, deliveryDays: 5,
  },
];

export const allProducts = [...featuredRakhis, ...comboSets];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

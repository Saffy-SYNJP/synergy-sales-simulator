export type ObjectionCategory =
  | "price"
  | "quality"
  | "brand"
  | "supply"
  | "terms"
  | "relationship";

export interface Objection {
  id: number;
  category: ObjectionCategory;
  text: string;
}

export const CATEGORY_LABELS: Record<ObjectionCategory, string> = {
  price: "Price & Cost",
  quality: "Quality & Trust",
  brand: "Brand & White-Label",
  supply: "Supply & Logistics",
  terms: "Business Terms",
  relationship: "Relationship & Timing",
};

export const OBJECTIONS: Objection[] = [
  { id: 1, category: "price", text: "Your price is too high compared to Castrol or Shell" },
  { id: 2, category: "price", text: "My current supplier gives me better credit terms and lower price — why should I switch?" },
  { id: 3, category: "price", text: "The shipping cost makes your product uncompetitive in my market" },
  { id: 4, category: "price", text: "I can get cheaper oil locally — same grade, lower price" },

  { id: 5, category: "quality", text: "How do I know your quality is consistent batch to batch?" },
  { id: 6, category: "quality", text: "Do you have API certification, TDS, and MSDS documents?" },
  { id: 7, category: "quality", text: "My customers only trust international brands — they won't accept EcoMatic" },
  { id: 8, category: "quality", text: "I had a bad experience with a cheap Asian lubricant supplier before" },

  { id: 9, category: "brand", text: "I already have my own brand — I don't want to carry another brand" },
  { id: 10, category: "brand", text: "If I white-label with you and you disappear, my brand is finished" },
  { id: 11, category: "brand", text: "My customers have been loyal to their current brand for years — switching is a risk" },

  { id: 12, category: "supply", text: "Can you guarantee monthly stock availability? My last supplier kept running out" },
  { id: 13, category: "supply", text: "Your lead time is too long — I need product within 2 weeks" },
  { id: 14, category: "supply", text: "I'm worried about customs clearance and import documentation in my country" },

  { id: 15, category: "terms", text: "I need 60-90 day credit terms — upfront payment is impossible for me" },
  { id: 16, category: "terms", text: "Your MOQ is too high — I'm a small operation and can't move that volume" },
  { id: 17, category: "terms", text: "I want exclusive distribution rights for my territory before I commit" },

  { id: 18, category: "relationship", text: "I'm happy with my current supplier — I don't want to change" },
  { id: 19, category: "relationship", text: "I need to consult my business partner before making any decision" },
  { id: 20, category: "relationship", text: "This is not a good time — call me again in 3 months" },
];

export function getObjectionsByCategory(cat: ObjectionCategory): Objection[] {
  return OBJECTIONS.filter((o) => o.category === cat);
}

export function getObjectionById(id: number): Objection | undefined {
  return OBJECTIONS.find((o) => o.id === id);
}

export function pickRandom(): Objection {
  return OBJECTIONS[Math.floor(Math.random() * OBJECTIONS.length)];
}

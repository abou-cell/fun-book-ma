import type { ActivityCardProps } from "@/components/ActivityCard";

export const categories = ["Quad", "Surf", "Spa", "Kids", "Experiences"];

export const popularActivities: ActivityCardProps[] = [
  {
    title: "Sunset Quad in Agafay Desert",
    city: "Marrakech",
    category: "Quad",
    price: 420,
    image:
      "https://images.unsplash.com/photo-1683020896201-d4f7fbf8af86?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Surf Session at Taghazout Bay",
    city: "Taghazout",
    category: "Surf",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Traditional Hammam & Spa Ritual",
    city: "Fes",
    category: "Spa",
    price: 290,
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Family Day at Atlas Adventure Park",
    city: "Ifrane",
    category: "Kids",
    price: 240,
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  },
];

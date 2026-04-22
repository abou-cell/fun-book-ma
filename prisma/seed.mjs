import bcrypt from "bcryptjs";
import { ActivityCategory, PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser({ email, name, role, password }) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      password: hashedPassword,
    },
    create: {
      email,
      name,
      role,
      password: hashedPassword,
    },
  });
}

const activities = [
  {
    title: "Sunset Quad in Marrakech Palm Grove",
    slug: "sunset-quad-marrakech-palm-grove",
    shortDescription: "Ride across the Palmeraie trails with tea at a desert camp.",
    description:
      "Start with a safety briefing before riding quad bikes through palm groves and rocky tracks. Pause for mint tea in a traditional tent and enjoy golden-hour views before heading back.",
    city: "Marrakech",
    category: ActivityCategory.ADVENTURE,
    price: 420,
    rating: 4.8,
    reviewCount: 124,
    duration: "3 hours",
    coverImage:
      "https://images.unsplash.com/photo-1683020896201-d4f7fbf8af86?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1683020896201-d4f7fbf8af86?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    title: "Surf Lesson in Taghazout Bay",
    slug: "surf-lesson-taghazout-bay",
    shortDescription: "Beginner-friendly surf coaching with all equipment included.",
    description:
      "Meet your surf coach on Taghazout beach, warm up, and learn paddling, take-off, and wave timing. This session includes board rental, wetsuit, and beach transport from central Taghazout.",
    city: "Taghazout",
    category: ActivityCategory.SURF,
    price: 350,
    rating: 4.7,
    reviewCount: 98,
    duration: "2.5 hours",
    coverImage:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    title: "Luxury Hammam & Spa Ritual in Casablanca",
    slug: "luxury-hammam-spa-casablanca",
    shortDescription: "Traditional steam ritual with argan scrub and massage.",
    description:
      "Unwind in a premium hammam with steam therapy, black-soap exfoliation, and a restorative argan oil massage. The experience ends with herbal tea in a private lounge.",
    city: "Casablanca",
    category: ActivityCategory.WELLNESS,
    price: 520,
    rating: 4.9,
    reviewCount: 76,
    duration: "2 hours",
    coverImage:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    title: "Kids Pottery Workshop in Rabat Medina",
    slug: "kids-pottery-workshop-rabat-medina",
    shortDescription: "Creative pottery class for children with local artisans.",
    description:
      "Children learn basic clay shaping and decoration techniques in a safe, playful studio. Each child keeps their handmade piece as a souvenir.",
    city: "Rabat",
    category: ActivityCategory.KIDS,
    price: 220,
    rating: 4.6,
    reviewCount: 51,
    duration: "1.5 hours",
    coverImage:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    title: "Desert Excursion near Agafay",
    slug: "desert-excursion-near-agafay",
    shortDescription: "4x4 transfer, camel ride, and dinner under the stars.",
    description:
      "Travel from Marrakech to Agafay for a complete desert evening with camel trek, sunset views, and a Moroccan dinner with live local music.",
    city: "Agafay",
    category: ActivityCategory.NATURE,
    price: 690,
    rating: 4.9,
    reviewCount: 182,
    duration: "5 hours",
    coverImage:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1544985361-b420d7a77043?auto=format&fit=crop&w=1400&q=80",
    ],
  },
];

async function main() {
  const admin = await upsertUser({
    email: "admin@funbook.ma",
    name: "FunBook Admin",
    role: UserRole.ADMIN,
    password: "AdminPass123",
  });

  const providerUser = await upsertUser({
    email: "provider@funbook.ma",
    name: "Atlas Adventures",
    role: UserRole.PROVIDER,
    password: "ProviderPass123",
  });

  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {
      businessName: "Atlas Adventures",
      city: "Marrakech",
      description: "Premium local guided experiences.",
    },
    create: {
      userId: providerUser.id,
      businessName: "Atlas Adventures",
      city: "Marrakech",
      description: "Premium local guided experiences.",
    },
  });

  await upsertUser({
    email: "client@funbook.ma",
    name: "FunBook Client",
    role: UserRole.CLIENT,
    password: "ClientPass123",
  });

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { slug: activity.slug },
      update: {
        providerId: provider.id,
        title: activity.title,
        shortDescription: activity.shortDescription,
        description: activity.description,
        city: activity.city,
        category: activity.category,
        price: activity.price,
        rating: activity.rating,
        reviewCount: activity.reviewCount,
        duration: activity.duration,
        coverImage: activity.coverImage,
        isActive: true,
        images: {
          deleteMany: {},
          create: activity.images.map((imageUrl, index) => ({
            imageUrl,
            altText: activity.title,
            sortOrder: index,
          })),
        },
      },
      create: {
        providerId: provider.id,
        title: activity.title,
        slug: activity.slug,
        shortDescription: activity.shortDescription,
        description: activity.description,
        city: activity.city,
        category: activity.category,
        price: activity.price,
        rating: activity.rating,
        reviewCount: activity.reviewCount,
        duration: activity.duration,
        coverImage: activity.coverImage,
        isActive: true,
        images: {
          create: activity.images.map((imageUrl, index) => ({
            imageUrl,
            altText: activity.title,
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log(`Seeded admin: ${admin.email}`);
  console.log(`Seeded activities: ${activities.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

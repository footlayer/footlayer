
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // LOAFERS/PUMPY SHOES
  {
    name: "Classic Brown Leather Loafer",
    description: "Premium quality brown leather loafers with elegant design. Perfect for formal occasions and business meetings. Crafted with genuine leather for durability and comfort.",
    price: 8500,
    imageUrl: "https://media.sperry.com/v3/product/gcpennywoven_mm/236-001-050/gcpennywoven_mm_brown_236-001-050_main_sq_wt_4800x4800.jpg",
    category: "LOAFERS",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Brown"],
    featured: true
  },
  {
    name: "Milano Black Leather Loafer",
    description: "Sophisticated black leather loafers with modern Milano styling. These premium shoes offer both comfort and elegance for the modern gentleman.",
    price: 9200,
    imageUrl: "https://deltoroshoes.com/cdn/shop/files/Milano_BlackLeather_AboveCloseup_PDP.png?v=1753931243&width=1080",
    category: "LOAFERS",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Black"],
    featured: true
  },
  {
    name: "Penny Loafer Classic Black",
    description: "Traditional penny loafers in classic black leather. Timeless design that complements both formal and casual attire. Made with premium materials for lasting wear.",
    price: 7800,
    imageUrl: "https://images.accentuate.io/?image=https%3A%2F%2Fcdn.accentuate.io%2F39804207333538%2F1626096488480%2FMartin-leather-slip-on-shoes-in-black.jpg%3Fv%3D0&c_options=",
    category: "LOAFERS",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Black"]
  },
  {
    name: "Brown Tweed Tassel Loafer",
    description: "Distinctive brown tweed loafers with elegant tassel detailing. Perfect blend of traditional craftsmanship and contemporary style for the fashion-conscious man.",
    price: 10500,
    imageUrl: "https://www.adorsi.com/cdn/shop/files/Brown-Tweed-Tassel-Loafer-1_2048x.jpg?v=1705340679",
    category: "LOAFERS",
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["Brown", "Tweed"]
  },
  {
    name: "Executive Penny Loafers",
    description: "Executive-grade black penny loafers with polished finish. These premium loafers are designed for business professionals who value quality and style.",
    price: 8800,
    imageUrl: "https://thumbs.dreamstime.com/b/classic-black-leather-penny-loafers-polished-finish-isolated-white-background-ai-generated-325088944.jpg",
    category: "LOAFERS",
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    colors: ["Black"]
  },

  // PESHAWARI TRADITIONAL CHAPPALS
  {
    name: "Traditional Peshawari Sandal",
    description: "Authentic Peshawari sandals with traditional leather craftsmanship. Comfortable and stylish, perfect for cultural events and casual wear.",
    price: 3200,
    imageUrl: "https://www.shutterstock.com/image-photo/stylish-peshawari-sandel-isolated-on-600nw-2651332199.jpg",
    category: "PESHAWARI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Tan", "Brown"],
    featured: true
  },
  {
    name: "Premium Kaptaan Chappal White",
    description: "Premium white leather Kaptaan chappal with superior craftsmanship. Traditional Pakistani footwear reimagined with modern comfort and durability.",
    price: 4500,
    imageUrl: "https://yubaric.com/wp-content/uploads/2023/06/13-1.jpg",
    category: "PESHAWARI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["White", "Cream"],
    featured: true
  },
  {
    name: "Handmade Peshawari Chappal",
    description: "Handcrafted traditional Peshawari chappal made by skilled artisans. Each pair is unique and represents authentic Pakistani leather craftsmanship.",
    price: 3800,
    imageUrl: "https://i.etsystatic.com/47114708/r/il/48b709/5784260062/il_fullxfull.5784260062_d0as.jpg",
    category: "PESHAWARI",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Brown", "Tan"]
  },
  {
    name: "Cross Strapped Brown Peshawari",
    description: "Classic cross-strapped brown Peshawari chappal with traditional design. Comfortable for daily wear and perfect for cultural occasions.",
    price: 3500,
    imageUrl: "https://www.voganow.com/cdn/shop/files/VNGFS-4753-014-BO-GM_1.jpg?v=1754550518",
    category: "PESHAWARI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Brown"]
  },
  {
    name: "Traditional Tan Peshawari",
    description: "Traditional tan colored Peshawari chappal with authentic styling. Made from high-quality leather for comfort and longevity.",
    price: 3600,
    imageUrl: "https://www.shutiq.com/cdn/shop/products/Peshawari_tan_2.jpg?crop=center&height=1200&v=1645093119&width=1200",
    category: "PESHAWARI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Tan"]
  },

  // SANDALS
  {
    name: "Casual Leather Sandals",
    description: "Comfortable olive leather sandals perfect for casual outings. Modern design with quality leather construction for everyday wear.",
    price: 2800,
    imageUrl: "https://images.pexels.com/photos/26925258/pexels-photo-26925258/free-photo-of-top-view-of-olive-leather-sandals.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    category: "SANDALS",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Olive", "Green"]
  },
  {
    name: "Blue Comfort Flip Flops",
    description: "Comfortable blue flip flops with cushioned sole. Perfect for beach visits, casual walks, and relaxed everyday wear.",
    price: 1200,
    imageUrl: "https://media.istockphoto.com/id/479297758/photo/blue-flip-flops-isolated.jpg?s=612x612&w=0&k=20&c=nYBzPFp3A3_6o0noedzrld-OzkT52jBusZDI1OK28uM=",
    category: "SANDALS",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Blue"]
  },
  {
    name: "Men's Brown Leather Sandals",
    description: "Premium brown leather sandals with adjustable straps. Durable construction and comfortable fit for active lifestyle.",
    price: 3500,
    imageUrl: "https://media.istockphoto.com/id/934521142/photo/men-sandals-on-white-background.jpg?s=612x612&w=0&k=20&c=psf1sM1a3EdFajRxNJLT41N8zcERuN5TcdC4QJjjPmE=",
    category: "SANDALS",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Brown"],
    featured: true
  },
  {
    name: "White Double-Buckle Slides",
    description: "Modern white leather slides with double-buckle design. Contemporary style meets comfort for fashionable casual wear.",
    price: 4200,
    imageUrl: "https://fashionitalia.com/cdn/shop/products/W60.webp?v=1709449252&width=1200",
    category: "SANDALS",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["White"]
  },
  {
    name: "Strappy Leather Sandals",
    description: "Stylish strappy leather sandals with intricate design. Perfect combination of traditional craftsmanship and modern comfort.",
    price: 3800,
    imageUrl: "https://i.etsystatic.com/17566354/r/il/07df1b/2403152948/il_300x300.2403152948_3n6d.jpg",
    category: "SANDALS",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Brown", "Tan"]
  },

  // TRADITIONAL SAUDI CHAPPALS
  {
    name: "White Arabic Sandals",
    description: "Elegant white Arabic sandals with traditional Middle Eastern design. Perfect for religious occasions and formal cultural events.",
    price: 4800,
    imageUrl: "https://silk-official.com/cdn/shop/files/2530_MATT_White.jpg?v=1742983156&width=1200",
    category: "SAUDI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["White"],
    featured: true
  },
  {
    name: "Ihram White Sandals",
    description: "Premium Ihram white sandals specially designed for Hajj and Umrah. Islamic footwear with comfortable design for spiritual journeys.",
    price: 5200,
    imageUrl: "https://shopipersia.com/wp-content/uploads/2024/07/Ihram-White-Sandals-Islamic-Footwear-for-Hajj-Umrah-1.jpg",
    category: "SAUDI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["White"],
    featured: true
  },
  {
    name: "Traditional Arabic Sandals",
    description: "Authentic traditional Arabic sandals with classic Middle Eastern styling. High-quality leather construction for comfort and durability.",
    price: 4500,
    imageUrl: "https://www.dhukkan.com/cdn/shop/products/Ferrini-Mens-White-ArabicSandal-Side@2x.jpg?v=1716296578",
    category: "SAUDI",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["White", "Cream"]
  },
  {
    name: "Saudi Style Slippers",
    description: "Contemporary Saudi style slippers with modern comfort features. Perfect blend of traditional design and modern functionality.",
    price: 3800,
    imageUrl: "https://sc04.alicdn.com/kf/H6e0cda57c0bb4556b3818db0c0b8c2e8X.png",
    category: "SAUDI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Brown", "Tan"]
  },
  {
    name: "Moroccan Leather Sandals",
    description: "Handcrafted Moroccan leather sandals with intricate traditional patterns. Premium quality leather with authentic Middle Eastern craftsmanship.",
    price: 5800,
    imageUrl: "https://www.swiqatcrafts.com/cdn/shop/files/Handcrafted_Moroccan_Leather_Sandals-4_3000x.jpg?v=1731264127",
    category: "SAUDI",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Brown", "Black", "Tan"]
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('🗑️  Cleared existing data');

  // Create categories first
  const categories = [
    { name: 'Loafers', slug: 'loafers' },
    { name: 'Peshawari Chappals', slug: 'peshawari' },
    { name: 'Sandals', slug: 'sandals' },
    { name: 'Saudi Chappals', slug: 'saudi' }
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: categoryData
    });
    createdCategories.push(category);
    console.log(`✅ Created category: ${category.name}`);
  }

  // Create products with categoryId
  for (const productData of products) {
    const category = createdCategories.find(c => 
      (productData.category === "LOAFERS" && c.slug === "loafers") ||
      (productData.category === "PESHAWARI" && c.slug === "peshawari") ||
      (productData.category === "SANDALS" && c.slug === "sandals") ||
      (productData.category === "SAUDI" && c.slug === "saudi")
    );

    if (category) {
      const { category: _, ...productWithoutCategory } = productData;
      const product = await prisma.product.create({
        data: {
          ...productWithoutCategory,
          categoryId: category.id
        }
      });
      console.log(`✅ Created product: ${product.name}`);
    }
  }

  const productCount = await prisma.product.count();
  console.log(`\n🎉 Database seeded successfully!`);
  console.log(`📊 Total products created: ${productCount}`);
  console.log(`🛍️  Categories: Loafers (${products.filter(p => p.category === "LOAFERS").length}), Peshawari (${products.filter(p => p.category === "PESHAWARI").length}), Sandals (${products.filter(p => p.category === "SANDALS").length}), Saudi (${products.filter(p => p.category === "SAUDI").length})`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

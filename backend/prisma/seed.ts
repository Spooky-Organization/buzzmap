import {
  BusinessType,
  ConversationType,
  NotificationType,
  OrderStatus,
  PostType,
  POVMediaType,
  Prisma,
  PrismaClient,
  Role,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { initStorage, ensureBucket } from '../src/shared/storage/index.js';
import {
  uploadBufferToStorage,
  storageObjectExists,
} from '../src/shared/storage/upload.js';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

const SAMPLE_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
const SAMPLE_THUMBNAIL_URL = 'https://placehold.co/1280x720/png?text=BuzzMap+POV';
const SAMPLE_IMAGE_URL = 'https://placehold.co/1280x720/png?text=BuzzMap+Photo';

// ─── Seed image re-hosting (placeholder URLs → RustFS) ────────────────────────

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Ensure a seed image lives in RustFS under a deterministic key and return that
 * key. Idempotent and self-healing: if the object already exists it's reused; if
 * it's missing (first seed, or after a storage reset) the external placeholder
 * is fetched and uploaded. Network/storage failures fall back to the original
 * URL so seeding never breaks (e.g. offline or before storage is reachable).
 */
async function ensureSeedImage(sourceUrl: string, key: string): Promise<string> {
  try {
    if (await storageObjectExists(key)) return key;
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') ?? 'image/png';
    return await uploadBufferToStorage(key, buffer, contentType);
  } catch (err) {
    console.warn(
      `[seed] Could not re-host ${sourceUrl}; keeping original URL.`,
      (err as Error).message
    );
    return sourceUrl;
  }
}

type SeedUserInput = {
  email: string;
  name: string;
  role: Role;
  interests: string[];
  location: string;
  phone?: string;
  avatar?: string;
};

type SeedBusinessInput = {
  ownerEmail: string;
  businessName: string;
  description: string;
  category: string;
  type: BusinessType;
  location: string;
  contactInfo: string;
  operatingHours: Prisma.JsonObject;
  isVerified?: boolean;
};

type SeedProductInput = {
  businessName: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
};

type SeedPovInput = {
  authorEmail: string;
  businessName: string;
  caption: string;
  starRating: number;
  recommends: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
};

type SeedPostInput = {
  authorEmail: string;
  businessName?: string;
  type: PostType;
  content?: string;
  mediaUrls?: string[];
};

type SeedDirectConversationInput = {
  participantEmails: [string, string];
  messages: Array<{ senderEmail: string; content: string }>;
};

type SeedGroupConversationInput = {
  name: string;
  participantEmails: string[];
  messages: Array<{ senderEmail: string; content: string }>;
};

type SeedNotificationInput = {
  userEmail: string;
  type: NotificationType;
  title: string;
  body: string;
  read?: boolean;
  data?: Prisma.InputJsonValue;
};

type SeedOrderInput = {
  customerEmail: string;
  status: OrderStatus;
  items: Array<{ productName: string; quantity: number }>;
};

function isEnabled(value: string | undefined, defaultValue = false): boolean {
  if (value == null || value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

function requireValue(key: string): string | null {
  const value = process.env[key];
  if (!value) {
    console.warn(`[seed] ${key} is not set; skipping the dependent seed path.`);
    return null;
  }
  return value;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function ensureAdminUser(): Promise<void> {
  const adminEmail = process.env['SEED_ADMIN_EMAIL'] || 'testadmin@gmail.com';
  const adminName = process.env['SEED_ADMIN_NAME'] || 'Test Admin';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`[seed] Admin user already exists (${existing.email}), keeping existing record.`);
    return;
  }

  const password = requireValue('SEED_ADMIN_PASSWORD');
  if (!password) return;

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: await hashPassword(password),
      role: Role.ADMIN,
      interests: [],
    },
  });

  console.log(`[seed] Admin user seeded successfully (${admin.email}).`);
}

async function upsertUser(user: SeedUserInput, hashedPassword: string) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      password: hashedPassword,
      role: user.role,
      interests: user.interests,
      location: user.location,
      phone: user.phone,
      avatar: user.avatar,
    },
    create: {
      email: user.email,
      name: user.name,
      password: hashedPassword,
      role: user.role,
      interests: user.interests,
      location: user.location,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
}

async function upsertBusinessProfile(
  ownerId: string,
  business: Omit<SeedBusinessInput, 'ownerEmail'>
) {
  return prisma.businessProfile.upsert({
    where: { userId: ownerId },
    update: {
      businessName: business.businessName,
      description: business.description,
      category: business.category,
      type: business.type,
      location: business.location,
      contactInfo: business.contactInfo,
      operatingHours: business.operatingHours,
      isVerified: business.isVerified ?? true,
    },
    create: {
      userId: ownerId,
      businessName: business.businessName,
      description: business.description,
      category: business.category,
      type: business.type,
      location: business.location,
      contactInfo: business.contactInfo,
      operatingHours: business.operatingHours,
      isVerified: business.isVerified ?? true,
    },
  });
}

async function upsertProduct(
  businessId: string,
  product: Omit<SeedProductInput, 'businessName'>
) {
  const existing = await prisma.product.findFirst({
    where: { businessId, name: product.name },
  });

  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: product,
    });
  }

  return prisma.product.create({
    data: {
      businessId,
      ...product,
    },
  });
}

async function upsertPost(
  authorId: string,
  businessId: string | null,
  post: Omit<SeedPostInput, 'authorEmail' | 'businessName'>
) {
  const existing = await prisma.post.findFirst({
    where: {
      authorId,
      businessId,
      type: post.type,
      content: post.content ?? null,
    },
  });

  if (existing) {
    return prisma.post.update({
      where: { id: existing.id },
      data: {
        type: post.type,
        content: post.content ?? null,
        mediaUrls: post.mediaUrls ?? [],
      },
    });
  }

  return prisma.post.create({
    data: {
      authorId,
      businessId,
      type: post.type,
      content: post.content ?? null,
      mediaUrls: post.mediaUrls ?? [],
    },
  });
}

async function upsertPov(
  authorId: string,
  businessId: string,
  pov: Omit<SeedPovInput, 'authorEmail' | 'businessName'>
) {
  const existing = await prisma.pOV.findFirst({
    where: {
      authorId,
      businessId,
      caption: pov.caption,
    },
  });

  // Seed each POV with a mixed gallery (one video + one image) to demonstrate
  // the mixed-media feed.
  const media: Prisma.POVMediaCreateWithoutPovInput[] = [
    {
      url: pov.videoUrl ?? SAMPLE_VIDEO_URL,
      type: POVMediaType.VIDEO,
      thumbnailUrl: pov.thumbnailUrl ?? SAMPLE_THUMBNAIL_URL,
      position: 0,
    },
    {
      url: SAMPLE_IMAGE_URL,
      type: POVMediaType.IMAGE,
      thumbnailUrl: null,
      position: 1,
    },
  ];

  if (existing) {
    await prisma.pOVMedia.deleteMany({ where: { povId: existing.id } });
    return prisma.pOV.update({
      where: { id: existing.id },
      data: {
        caption: pov.caption,
        starRating: pov.starRating,
        recommends: pov.recommends,
        media: { create: media },
      },
    });
  }

  return prisma.pOV.create({
    data: {
      authorId,
      businessId,
      caption: pov.caption,
      starRating: pov.starRating,
      recommends: pov.recommends,
      media: { create: media },
    },
  });
}

async function upsertComment(userId: string, povId: string, content: string) {
  const existing = await prisma.comment.findFirst({
    where: { userId, povId, content },
  });

  if (existing) return existing;

  return prisma.comment.create({
    data: { userId, povId, content },
  });
}

async function ensureLike(userId: string, povId: string) {
  const existing = await prisma.like.findFirst({
    where: { userId, povId },
  });

  if (existing) return existing;

  return prisma.like.create({
    data: { userId, povId },
  });
}

async function ensureFollow(followerId: string, followingId: string) {
  return prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
    update: {},
    create: {
      followerId,
      followingId,
    },
  });
}

async function ensureCartItem(userId: string, productId: string, quantity: number) {
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity,
    },
  });
}

async function upsertNotification(userId: string, notification: Omit<SeedNotificationInput, 'userEmail'>) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: notification.type,
      title: notification.title,
    },
  });

  if (existing) {
    return prisma.notification.update({
      where: { id: existing.id },
      data: {
        body: notification.body,
        data: notification.data,
        read: notification.read ?? false,
      },
    });
  }

  return prisma.notification.create({
    data: {
      userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: notification.read ?? false,
    },
  });
}

async function findDirectConversation(userAId: string, userBId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      type: ConversationType.DIRECT,
      participants: {
        some: { userId: { in: [userAId, userBId] } },
      },
    },
    include: {
      participants: true,
    },
  });

  return conversations.find((conversation) => {
    const participantIds = conversation.participants.map((participant) => participant.userId).sort();
    return participantIds.length === 2 && participantIds[0] === [userAId, userBId].sort()[0] && participantIds[1] === [userAId, userBId].sort()[1];
  }) ?? null;
}

async function ensureDirectConversation(userAId: string, userBId: string) {
  const existing = await findDirectConversation(userAId, userBId);
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      participants: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
  });
}

async function ensureGroupConversation(name: string, participantIds: string[]) {
  const existing = await prisma.conversation.findFirst({
    where: {
      type: ConversationType.GROUP,
      name,
    },
    include: {
      participants: true,
    },
  });

  if (existing) {
    const existingIds = new Set(existing.participants.map((participant) => participant.userId));
    for (const participantId of participantIds) {
      if (!existingIds.has(participantId)) {
        await prisma.conversationParticipant.create({
          data: {
            conversationId: existing.id,
            userId: participantId,
          },
        });
      }
    }
    return existing;
  }

  return prisma.conversation.create({
    data: {
      type: ConversationType.GROUP,
      name,
      participants: {
        create: participantIds.map((userId) => ({ userId })),
      },
    },
  });
}

async function ensureMessage(conversationId: string, senderId: string, content: string) {
  const existing = await prisma.message.findFirst({
    where: {
      conversationId,
      senderId,
      content,
    },
  });

  if (existing) return existing;

  return prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
    },
  });
}

async function ensureOrder(
  customerId: string,
  status: OrderStatus,
  items: Array<{ productId: string; quantity: number; price: number }>
) {
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const existing = await prisma.order.findFirst({
    where: {
      customerId,
      status,
      totalAmount,
    },
  });

  const order = existing
    ? await prisma.order.update({
        where: { id: existing.id },
        data: { totalAmount, status },
      })
    : await prisma.order.create({
        data: {
          customerId,
          status,
          totalAmount,
        },
      });

  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.orderItem.createMany({
    data: items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
  });

  return order;
}

async function seedKenyanSampleData(): Promise<void> {
  if (!isEnabled(process.env['SEED_SAMPLE_DATA'], false)) {
    console.log('[seed] SEED_SAMPLE_DATA is not enabled; skipping Kenyan sample data.');
    return;
  }

  const samplePassword = requireValue('SEED_SAMPLE_PASSWORD');
  if (!samplePassword) return;

  const hashedPassword = await hashPassword(samplePassword);

  const sampleUsers: SeedUserInput[] = [
    {
      email: 'wanjiru.kariuki@buzzmap.ke',
      name: 'Wanjiru Kariuki',
      role: Role.BUSINESS_OWNER,
      interests: ['Electronics', 'Smartphones', 'Small Business'],
      location: 'Westlands, Nairobi',
      phone: '+254700111001',
      avatar: 'https://placehold.co/200x200/png?text=WK',
    },
    {
      email: 'aisha.omar@buzzmap.ke',
      name: 'Aisha Omar',
      role: Role.BUSINESS_OWNER,
      interests: ['Beauty', 'Skincare', 'Coastal Lifestyle'],
      location: 'Nyali, Mombasa',
      phone: '+254700111002',
      avatar: 'https://placehold.co/200x200/png?text=AO',
    },
    {
      email: 'sammy.kiptoo@buzzmap.ke',
      name: 'Sammy Kiptoo',
      role: Role.BUSINESS_OWNER,
      interests: ['Auto Care', 'Road Trips', 'Local Services'],
      location: 'Eldoret Town, Uasin Gishu',
      phone: '+254700111003',
      avatar: 'https://placehold.co/200x200/png?text=SK',
    },
    {
      email: 'brenda.njeri@buzzmap.ke',
      name: 'Brenda Njeri',
      role: Role.CUSTOMER,
      interests: ['Fashion', 'Coffee Spots', 'Skincare'],
      location: 'Kilimani, Nairobi',
      phone: '+254700111101',
      avatar: 'https://placehold.co/200x200/png?text=BN',
    },
    {
      email: 'kevin.otieno@buzzmap.ke',
      name: 'Kevin Otieno',
      role: Role.CUSTOMER,
      interests: ['Tech', 'Football', 'Sneakers'],
      location: 'Kisumu Central, Kisumu',
      phone: '+254700111102',
      avatar: 'https://placehold.co/200x200/png?text=KO',
    },
    {
      email: 'fatma.abdalla@buzzmap.ke',
      name: 'Fatma Abdalla',
      role: Role.CUSTOMER,
      interests: ['Travel', 'Beauty', 'Food'],
      location: 'Old Town, Mombasa',
      phone: '+254700111103',
      avatar: 'https://placehold.co/200x200/png?text=FA',
    },
    {
      email: 'brian.mutua@buzzmap.ke',
      name: 'Brian Mutua',
      role: Role.CUSTOMER,
      interests: ['Cars', 'Gaming', 'Streetwear'],
      location: 'Syokimau, Machakos',
      phone: '+254700111104',
      avatar: 'https://placehold.co/200x200/png?text=BM',
    },
  ];

  const sampleBusinesses: SeedBusinessInput[] = [
    {
      ownerEmail: 'wanjiru.kariuki@buzzmap.ke',
      businessName: 'Karibu Gadgets',
      description: 'Affordable smartphones, audio gear, and everyday accessories for Nairobi shoppers.',
      category: 'Electronics',
      type: BusinessType.PRODUCTS,
      location: 'Westlands, Nairobi',
      contactInfo: '+254 700 221 001 | hello@karibugadgets.co.ke',
      operatingHours: {
        monday: '08:30-18:30',
        tuesday: '08:30-18:30',
        wednesday: '08:30-18:30',
        thursday: '08:30-18:30',
        friday: '08:30-18:30',
        saturday: '09:00-17:00',
        sunday: 'Closed',
      },
      isVerified: true,
    },
    {
      ownerEmail: 'aisha.omar@buzzmap.ke',
      businessName: 'Pwani Glow',
      description: 'Coastal skincare and beauty picks curated for hot weather and everyday glow.',
      category: 'Beauty',
      type: BusinessType.PRODUCTS,
      location: 'Nyali, Mombasa',
      contactInfo: '+254 700 221 002 | orders@pwaniglow.co.ke',
      operatingHours: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-18:00',
        saturday: '09:00-16:00',
        sunday: '11:00-15:00',
      },
      isVerified: true,
    },
    {
      ownerEmail: 'sammy.kiptoo@buzzmap.ke',
      businessName: 'SafariFix Auto Care',
      description: 'Quick vehicle cleaning, detailing, and maintenance support for busy drivers in Eldoret.',
      category: 'Auto Services',
      type: BusinessType.SERVICES,
      location: 'Eldoret Town, Uasin Gishu',
      contactInfo: '+254 700 221 003 | book@safarifix.co.ke',
      operatingHours: {
        monday: '07:30-18:00',
        tuesday: '07:30-18:00',
        wednesday: '07:30-18:00',
        thursday: '07:30-18:00',
        friday: '07:30-18:00',
        saturday: '08:00-16:00',
        sunday: 'Closed',
      },
      isVerified: true,
    },
  ];

  const sampleProducts: SeedProductInput[] = [
    {
      businessName: 'Karibu Gadgets',
      name: 'Samsung Galaxy A15 128GB',
      description: 'Popular mid-range Android phone with reliable battery life and enough storage for daily use.',
      price: 25999,
      images: ['https://placehold.co/800x600/png?text=Galaxy+A15'],
      stock: 14,
      category: 'Smartphones',
    },
    {
      businessName: 'Karibu Gadgets',
      name: 'Oraimo 20000mAh Power Bank',
      description: 'Fast-charging power bank for commuters, campus life, and long matatu rides.',
      price: 3499,
      images: ['https://placehold.co/800x600/png?text=Power+Bank'],
      stock: 32,
      category: 'Accessories',
    },
    {
      businessName: 'Karibu Gadgets',
      name: 'JBL Go 4 Portable Speaker',
      description: 'Compact Bluetooth speaker for hangouts, house parties, and outdoor plans.',
      price: 6899,
      images: ['https://placehold.co/800x600/png?text=JBL+Go+4'],
      stock: 9,
      category: 'Audio',
    },
    {
      businessName: 'Pwani Glow',
      name: 'Baobab Body Butter',
      description: 'Rich coastal moisturizer made for dry skin and daily use in warm weather.',
      price: 1499,
      images: ['https://placehold.co/800x600/png?text=Body+Butter'],
      stock: 28,
      category: 'Skincare',
    },
    {
      businessName: 'Pwani Glow',
      name: 'SPF 50 Daily Sunscreen',
      description: 'Non-greasy sunscreen for beach days, commutes, and everyday outdoor routines.',
      price: 1899,
      images: ['https://placehold.co/800x600/png?text=Sunscreen'],
      stock: 24,
      category: 'Skincare',
    },
    {
      businessName: 'Pwani Glow',
      name: 'Kikoy Beach Tote',
      description: 'Lightweight tote inspired by the coast, useful for shopping or beach trips.',
      price: 2200,
      images: ['https://placehold.co/800x600/png?text=Kikoy+Tote'],
      stock: 15,
      category: 'Lifestyle',
    },
    {
      businessName: 'SafariFix Auto Care',
      name: 'Express Exterior Wash',
      description: 'A quick wash package for dusty town driving and weekday cleanups.',
      price: 1200,
      images: ['https://placehold.co/800x600/png?text=Exterior+Wash'],
      stock: 50,
      category: 'Auto Care',
    },
    {
      businessName: 'SafariFix Auto Care',
      name: 'Interior Detailing Session',
      description: 'Dashboard, seats, mats, and boot area deep-clean for family and rideshare vehicles.',
      price: 3500,
      images: ['https://placehold.co/800x600/png?text=Interior+Detailing'],
      stock: 20,
      category: 'Auto Care',
    },
    {
      businessName: 'SafariFix Auto Care',
      name: 'Weekend Full Service Package',
      description: 'Wash, polish, tire shine, and interior refresh for a full weekend cleanup.',
      price: 5500,
      images: ['https://placehold.co/800x600/png?text=Weekend+Package'],
      stock: 10,
      category: 'Auto Care',
    },
  ];

  const samplePosts: SeedPostInput[] = [
    {
      authorEmail: 'wanjiru.kariuki@buzzmap.ke',
      businessName: 'Karibu Gadgets',
      type: PostType.TEXT,
      content: 'Fresh Samsung and Oraimo stock is in. Westlands pickup is available all week.',
    },
    {
      authorEmail: 'aisha.omar@buzzmap.ke',
      businessName: 'Pwani Glow',
      type: PostType.IMAGE,
      content: 'Coast weather has been intense this week, so we restocked our daily sunscreen.',
      mediaUrls: ['https://placehold.co/1200x900/png?text=Pwani+Glow'],
    },
    {
      authorEmail: 'sammy.kiptoo@buzzmap.ke',
      businessName: 'SafariFix Auto Care',
      type: PostType.TEXT,
      content: 'Saturday detailing slots are now open for bookings before the long weekend.',
    },
  ];

  const samplePovs: SeedPovInput[] = [
    {
      authorEmail: 'kevin.otieno@buzzmap.ke',
      businessName: 'Karibu Gadgets',
      caption: 'Picked up the Galaxy A15 for day-to-day use and it feels solid for the price in Nairobi.',
      starRating: 5,
      recommends: true,
    },
    {
      authorEmail: 'fatma.abdalla@buzzmap.ke',
      businessName: 'Pwani Glow',
      caption: 'The sunscreen sits well under makeup and still works when the Mombasa sun is ruthless.',
      starRating: 4,
      recommends: true,
    },
    {
      authorEmail: 'brian.mutua@buzzmap.ke',
      businessName: 'SafariFix Auto Care',
      caption: 'Interior detailing was quick and the car smelled fresh the whole drive back to Nairobi.',
      starRating: 5,
      recommends: true,
    },
  ];

  const directConversations: SeedDirectConversationInput[] = [
    {
      participantEmails: ['brenda.njeri@buzzmap.ke', 'wanjiru.kariuki@buzzmap.ke'],
      messages: [
        {
          senderEmail: 'brenda.njeri@buzzmap.ke',
          content: 'Hi, do you still have the Oraimo power bank in stock?',
        },
        {
          senderEmail: 'wanjiru.kariuki@buzzmap.ke',
          content: 'Yes, we do. I can reserve one for Westlands pickup today.',
        },
      ],
    },
    {
      participantEmails: ['fatma.abdalla@buzzmap.ke', 'aisha.omar@buzzmap.ke'],
      messages: [
        {
          senderEmail: 'fatma.abdalla@buzzmap.ke',
          content: 'Is the SPF 50 sunscreen okay for daily beach use?',
        },
        {
          senderEmail: 'aisha.omar@buzzmap.ke',
          content: 'Yes, that one is one of our bestsellers for beach days and daily errands.',
        },
      ],
    },
  ];

  const groupConversations: SeedGroupConversationInput[] = [
    {
      name: 'Nairobi Weekend Finds',
      participantEmails: [
        'brenda.njeri@buzzmap.ke',
        'kevin.otieno@buzzmap.ke',
        'brian.mutua@buzzmap.ke',
      ],
      messages: [
        {
          senderEmail: 'brenda.njeri@buzzmap.ke',
          content: 'Anyone seen good weekend deals on tech or skincare this week?',
        },
        {
          senderEmail: 'kevin.otieno@buzzmap.ke',
          content: 'Karibu Gadgets has solid accessory prices right now.',
        },
      ],
    },
  ];

  const sampleNotifications: SeedNotificationInput[] = [
    {
      userEmail: 'wanjiru.kariuki@buzzmap.ke',
      type: NotificationType.NEW_FOLLOWER,
      title: 'New follower',
      body: 'Brenda Njeri followed Karibu Gadgets.',
      data: { followerName: 'Brenda Njeri' },
    },
    {
      userEmail: 'brenda.njeri@buzzmap.ke',
      type: NotificationType.ORDER_UPDATE,
      title: 'Order confirmed',
      body: 'Your Karibu Gadgets order has been confirmed for pickup.',
      data: { businessName: 'Karibu Gadgets' },
    },
    {
      userEmail: 'fatma.abdalla@buzzmap.ke',
      type: NotificationType.MESSAGE,
      title: 'New message',
      body: 'Aisha Omar replied to your sunscreen question.',
      data: { businessName: 'Pwani Glow' },
    },
  ];

  const sampleOrders: SeedOrderInput[] = [
    {
      customerEmail: 'brenda.njeri@buzzmap.ke',
      status: OrderStatus.CONFIRMED,
      items: [
        { productName: 'Oraimo 20000mAh Power Bank', quantity: 1 },
        { productName: 'JBL Go 4 Portable Speaker', quantity: 1 },
      ],
    },
    {
      customerEmail: 'brian.mutua@buzzmap.ke',
      status: OrderStatus.COMPLETED,
      items: [{ productName: 'Weekend Full Service Package', quantity: 1 }],
    },
  ];

  const usersByEmail = new Map<string, Awaited<ReturnType<typeof upsertUser>>>();
  for (const user of sampleUsers) {
    usersByEmail.set(user.email, await upsertUser(user, hashedPassword));
  }

  const businessesByName = new Map<string, Awaited<ReturnType<typeof upsertBusinessProfile>>>();
  for (const business of sampleBusinesses) {
    const owner = usersByEmail.get(business.ownerEmail);
    if (!owner) continue;
    businessesByName.set(
      business.businessName,
      await upsertBusinessProfile(owner.id, {
        businessName: business.businessName,
        description: business.description,
        category: business.category,
        type: business.type,
        location: business.location,
        contactInfo: business.contactInfo,
        operatingHours: business.operatingHours,
        isVerified: business.isVerified,
      })
    );
  }

  const productsByName = new Map<string, Awaited<ReturnType<typeof upsertProduct>>>();
  for (const product of sampleProducts) {
    const business = businessesByName.get(product.businessName);
    if (!business) continue;

    // Re-host placeholder images into RustFS under deterministic keys. The
    // helper is idempotent (skips upload when the object already exists) and
    // self-heals after a storage reset, so this is safe to run on every boot.
    const images = await Promise.all(
      product.images.map((url, i) =>
        ensureSeedImage(url, `products/seed/${slugify(product.name)}-${i}.png`)
      )
    );

    productsByName.set(
      product.name,
      await upsertProduct(business.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        images,
        stock: product.stock,
        category: product.category,
      })
    );
  }

  for (const post of samplePosts) {
    const author = usersByEmail.get(post.authorEmail);
    if (!author) continue;
    const business = post.businessName ? businessesByName.get(post.businessName) : null;
    await upsertPost(author.id, business?.id ?? null, {
      type: post.type,
      content: post.content,
      mediaUrls: post.mediaUrls,
    });
  }

  const povsByCaption = new Map<string, Awaited<ReturnType<typeof upsertPov>>>();
  for (const pov of samplePovs) {
    const author = usersByEmail.get(pov.authorEmail);
    const business = businessesByName.get(pov.businessName);
    if (!author || !business) continue;
    povsByCaption.set(
      pov.caption,
      await upsertPov(author.id, business.id, {
        caption: pov.caption,
        starRating: pov.starRating,
        recommends: pov.recommends,
        videoUrl: pov.videoUrl,
        thumbnailUrl: pov.thumbnailUrl,
      })
    );
  }

  await upsertComment(
    usersByEmail.get('brenda.njeri@buzzmap.ke')!.id,
    povsByCaption.get(samplePovs[0]!.caption)!.id,
    'Battery life feedback is exactly what I needed before buying.'
  );
  await upsertComment(
    usersByEmail.get('kevin.otieno@buzzmap.ke')!.id,
    povsByCaption.get(samplePovs[1]!.caption)!.id,
    'Useful review. I need something light for travel as well.'
  );
  await ensureLike(usersByEmail.get('brenda.njeri@buzzmap.ke')!.id, povsByCaption.get(samplePovs[0]!.caption)!.id);
  await ensureLike(usersByEmail.get('fatma.abdalla@buzzmap.ke')!.id, povsByCaption.get(samplePovs[1]!.caption)!.id);
  await ensureLike(usersByEmail.get('kevin.otieno@buzzmap.ke')!.id, povsByCaption.get(samplePovs[2]!.caption)!.id);

  await ensureFollow(
    usersByEmail.get('brenda.njeri@buzzmap.ke')!.id,
    usersByEmail.get('wanjiru.kariuki@buzzmap.ke')!.id
  );
  await ensureFollow(
    usersByEmail.get('fatma.abdalla@buzzmap.ke')!.id,
    usersByEmail.get('aisha.omar@buzzmap.ke')!.id
  );
  await ensureFollow(
    usersByEmail.get('brian.mutua@buzzmap.ke')!.id,
    usersByEmail.get('sammy.kiptoo@buzzmap.ke')!.id
  );

  await ensureCartItem(
    usersByEmail.get('kevin.otieno@buzzmap.ke')!.id,
    productsByName.get('Samsung Galaxy A15 128GB')!.id,
    1
  );
  await ensureCartItem(
    usersByEmail.get('kevin.otieno@buzzmap.ke')!.id,
    productsByName.get('SPF 50 Daily Sunscreen')!.id,
    2
  );

  for (const conversation of directConversations) {
    const [firstEmail, secondEmail] = conversation.participantEmails;
    const firstUser = usersByEmail.get(firstEmail);
    const secondUser = usersByEmail.get(secondEmail);
    if (!firstUser || !secondUser) continue;

    const directConversation = await ensureDirectConversation(firstUser.id, secondUser.id);
    for (const message of conversation.messages) {
      const sender = usersByEmail.get(message.senderEmail);
      if (!sender) continue;
      await ensureMessage(directConversation.id, sender.id, message.content);
    }
  }

  for (const conversation of groupConversations) {
    const participantIds = conversation.participantEmails
      .map((email) => usersByEmail.get(email)?.id)
      .filter((value): value is string => Boolean(value));

    const groupConversation = await ensureGroupConversation(conversation.name, participantIds);
    for (const message of conversation.messages) {
      const sender = usersByEmail.get(message.senderEmail);
      if (!sender) continue;
      await ensureMessage(groupConversation.id, sender.id, message.content);
    }
  }

  for (const notification of sampleNotifications) {
    const user = usersByEmail.get(notification.userEmail);
    if (!user) continue;
    await upsertNotification(user.id, {
      type: notification.type,
      title: notification.title,
      body: notification.body,
      read: notification.read,
      data: notification.data,
    });
  }

  for (const order of sampleOrders) {
    const customer = usersByEmail.get(order.customerEmail);
    if (!customer) continue;

    const items = order.items
      .map((item) => {
        const product = productsByName.get(item.productName);
        if (!product) return null;
        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        };
      })
      .filter((value): value is { productId: string; quantity: number; price: number } => Boolean(value));

    await ensureOrder(customer.id, order.status, items);
  }

  console.log(`[seed] Kenyan sample data ensured for ${sampleUsers.length} users, ${sampleBusinesses.length} businesses, and ${sampleProducts.length} products.`);
}

async function main() {
  await ensureAdminUser();
  // Storage is needed to re-host seed product images; tolerate it being
  // unreachable (re-hosting then falls back to the placeholder URLs).
  try {
    initStorage();
    await ensureBucket();
  } catch (err) {
    console.warn(
      '[seed] Storage not ready; product images will keep placeholder URLs.',
      (err as Error).message
    );
  }
  await seedKenyanSampleData();
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

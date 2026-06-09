'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Hexagon,
  Video,
  Shield,
  MessageSquare,
  ShoppingBag,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle,
  MapPin,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { appRoutes } from '@/lib/routes';
import { LegalDocumentDialog } from '@/components/legal/legal-document-dialog';

/* ─── animation helpers ─── */
import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function AnimatedSection({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── honeycomb SVG pattern ─── */
function HoneycombPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <pattern id="honeycomb" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
          <path
            d="M28 66L0 50V16L28 0L56 16V50L28 66ZM28 100L0 84V50L28 34L56 50V84L28 100Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#honeycomb)" />
    </svg>
  );
}

/* ─── hero POV showcase card (decorative) ─── */
function HeroPOVCard({
  initials,
  name,
  location,
  caption,
  rating,
  kind,
  duration,
  mediaClassName,
  recommends = true,
}: {
  initials: string;
  name: string;
  location: string;
  caption: string;
  rating: number;
  kind: 'video' | 'photo';
  duration?: string;
  mediaClassName: string;
  recommends?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.22_0.045_255)]/95 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-sm">
      {/* media */}
      <div className={`relative aspect-[5/4] w-full ${mediaClassName}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.22),transparent_55%)]" />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {kind === 'video' ? <Play className="size-2.5 fill-current" /> : <ShoppingBag className="size-2.5" />}
          {kind}
        </span>
        {kind === 'video' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
                <Play className="size-4 fill-white text-white" />
              </div>
            </div>
            {duration && (
              <span className="absolute bottom-2.5 right-2.5 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white">
                {duration}
              </span>
            )}
          </>
        )}
      </div>
      {/* body */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
            {initials}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold text-white">{name}</p>
            <p className="flex items-center gap-0.5 text-[10px] text-white/50">
              <MapPin className="size-2.5" />
              {location}
            </p>
          </div>
          {recommends && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
              <CheckCircle className="size-2.5" />
              Recommends
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3 ${i < rating ? 'fill-accent text-accent' : 'fill-white/10 text-white/10'}`}
            />
          ))}
        </div>
        <p className="text-[11px] leading-snug text-white/70">{caption}</p>
      </div>
    </div>
  );
}

/* ─── stat counter ─── */
function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
      <Icon className="size-6 text-accent" />
      <span className="text-3xl font-bold text-primary-foreground md:text-4xl">{value}</span>
      <span className="text-sm text-primary-foreground/70">{label}</span>
    </motion.div>
  );
}

/* ─── feature card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="group relative h-full overflow-hidden border-border/50 bg-card transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/5">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
            <Icon className="size-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── step card ─── */
function StepCard({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 text-center">
      <div className="relative">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/25">
          <Icon className="size-7" />
        </div>
        <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {step}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  );
}

/* ─── testimonial card ─── */
function TestimonialCard({
  name,
  role,
  content,
  initials,
  rating,
}: {
  name: string;
  role: string;
  content: string;
  initials: string;
  rating: number;
}) {
  return (
    <motion.div variants={scaleIn}>
      <Card className="h-full border-border/50 bg-card">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex gap-0.5">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="size-4 fill-accent text-accent" />
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground italic">
            &ldquo;{content}&rdquo;
          </p>
          <Separator />
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Hexagon className="size-7 text-accent" />
            <span className="text-xl font-bold text-primary">BuzzMap</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
            <a href="#testimonials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={appRoutes.auth.login} />}>
              <ArrowRight data-icon="inline-start" />
              Sign in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href={appRoutes.auth.registerCustomer} />}>
              <Users data-icon="inline-start" />
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-primary">
        {/* atmosphere */}
        <HoneycombPattern className="absolute inset-0 text-white/[0.035]" />
        <div className="pointer-events-none absolute -top-40 right-0 size-[34rem] rounded-full bg-accent/20 blur-[150px]" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 size-[28rem] rounded-full bg-accent/10 blur-[130px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28"
        >
          {/* LEFT — editorial copy */}
          <div className="flex flex-col items-start gap-6 text-left">
            <motion.div variants={fadeUp}>
              <Badge
                variant="outline"
                className="gap-2 rounded-full border-accent/30 bg-accent/10 py-1 pl-2 pr-3 text-accent"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                Launching in East Africa
              </Badge>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.4em] text-accent/80"
            >
              For you · by you
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-balance text-5xl font-extrabold leading-[0.95] tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl"
            >
              See it. Believe it.{' '}
              <span className="relative inline-block text-accent">
                Support it.
                <svg
                  className="absolute -bottom-2 left-0 h-2.5 w-full text-accent/60"
                  viewBox="0 0 200 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7C50 2 90 2 120 5C150 8 180 4 198 3"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="max-w-xl text-lg leading-relaxed text-primary-foreground/70"
            >
              BuzzMap turns honest customer{' '}
              <span className="font-medium text-primary-foreground">POVs</span> — short
              videos and photos — into the trust signal that helps you find the best
              sellers and shops online.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-accent text-white shadow-lg shadow-accent/25 transition-all hover:bg-[oklch(0.68_0.17_65)] hover:shadow-xl active:scale-[0.98]"
                nativeButton={false}
                render={<Link href={appRoutes.auth.registerCustomer} />}
              >
                Start Exploring
                <ArrowRight className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                nativeButton={false}
                render={<Link href={appRoutes.auth.registerBusiness} />}
              >
                <Play className="mr-2 size-4" />
                List Your Business
              </Button>
            </motion.div>

            {/* trust strip */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {['AW', 'KO', 'FA', 'BM'].map((init, idx) => (
                  <span
                    key={init}
                    className={`flex size-9 items-center justify-center rounded-full border-2 border-primary text-[11px] font-bold ${
                      idx % 2 === 0
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-[oklch(0.42_0.07_255)] text-white'
                    }`}
                  >
                    {init}
                  </span>
                ))}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-accent text-accent" />
                  ))}
                  <span className="ml-1 text-sm font-bold text-primary-foreground">4.8</span>
                </div>
                <p className="text-xs text-primary-foreground/60">
                  from 120K+ real customer POVs
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — POV collage */}
          <motion.div
            variants={stagger}
            className="relative mx-auto hidden h-[30rem] w-full max-w-sm sm:block lg:h-[34rem] lg:max-w-md"
          >
            {/* back card */}
            <motion.div
              variants={scaleIn}
              className="absolute left-0 top-2 w-44 -rotate-6 lg:w-48"
            >
              <HeroPOVCard
                initials="FA"
                name="Fatma A."
                location="Mombasa"
                caption="Fresh produce, fair prices — my weekly stop."
                rating={4}
                kind="photo"
                mediaClassName="bg-gradient-to-br from-[oklch(0.5_0.11_75)] to-[oklch(0.32_0.06_40)]"
              />
            </motion.div>

            {/* bottom card */}
            <motion.div
              variants={scaleIn}
              className="absolute bottom-0 left-6 z-20 w-48 -rotate-2 lg:w-52"
            >
              <HeroPOVCard
                initials="KO"
                name="Kevin O."
                location="Kisumu"
                caption="Fast service and the fittings actually last."
                rating={5}
                kind="video"
                duration="0:18"
                mediaClassName="bg-gradient-to-br from-[oklch(0.46_0.08_210)] to-[oklch(0.28_0.06_255)]"
              />
            </motion.div>

            {/* front hero card */}
            <motion.div
              variants={scaleIn}
              className="absolute right-0 top-16 z-30 w-52 rotate-3 lg:w-60"
            >
              <HeroPOVCard
                initials="AW"
                name="Aisha W."
                location="Nairobi"
                caption="Best mandazi in town — the queue is worth it."
                rating={5}
                kind="video"
                duration="0:24"
                mediaClassName="bg-gradient-to-br from-[oklch(0.6_0.15_75)] to-[oklch(0.34_0.07_300)]"
              />
            </motion.div>

            {/* floating rating chip */}
            <motion.div variants={scaleIn} className="absolute -left-3 top-32 z-40 lg:-left-6">
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[oklch(0.22_0.045_255)]/95 px-3 py-2 shadow-xl shadow-black/40 backdrop-blur-sm"
              >
                <span className="flex size-8 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Star className="size-4 fill-accent" />
                </span>
                <div className="leading-none">
                  <p className="text-sm font-bold text-white">4.9</p>
                  <p className="text-[10px] text-white/50">avg POV rating</p>
                </div>
              </motion.div>
            </motion.div>

            {/* floating brand hex */}
            <motion.div variants={scaleIn} className="absolute -right-2 top-4 z-40 lg:right-2">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="flex size-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15 text-accent shadow-xl shadow-accent/10 backdrop-blur-sm"
              >
                <Hexagon className="size-6 fill-accent/20" />
              </motion.div>
            </motion.div>

            {/* floating recommend chip */}
            <motion.div variants={scaleIn} className="absolute -bottom-3 right-2 z-40">
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-xl shadow-black/30 backdrop-blur-sm"
              >
                <CheckCircle className="size-3.5" />
                94% recommend
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <AnimatedSection className="bg-primary border-t border-white/5">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          <StatCard icon={Users} value="50K+" label="Active Users" />
          <StatCard icon={Video} value="120K+" label="Video POVs" />
          <StatCard icon={ShoppingBag} value="8K+" label="Businesses" />
          <StatCard icon={Star} value="4.8" label="Average Rating" />
        </div>
      </AnimatedSection>

      {/* ─── FEATURES ─── */}
      <AnimatedSection className="py-24 md:py-32" id="features">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Everything you need to{' '}
              <span className="text-accent">discover & grow</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              A trust-driven marketplace combining social content, e-commerce, and
              real-time messaging in one platform.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Video}
              title="Video POVs"
              description="Real customer footage that shows what a place actually feels like."
            />
            <FeatureCard
              icon={Shield}
              title="Trust-Driven"
              description="Ratings and recommendations stay tied to real customer activity."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Real-Time Messaging"
              description="Ask a business before you buy instead of guessing from a listing."
            />
            <FeatureCard
              icon={ShoppingBag}
              title="Product Shelf"
              description="Browse what is actually on offer and move straight into checkout."
            />
            <FeatureCard
              icon={MapPin}
              title="Local Discovery"
              description="Use POVs and location context to find strong nearby options fast."
            />
            <FeatureCard
              icon={Smartphone}
              title="Business Profiles"
              description="Profiles, posts, and POVs work together as the public trust surface."
            />
          </div>
        </div>
      </AnimatedSection>

      {/* ─── HOW IT WORKS ─── */}
      <AnimatedSection className="relative overflow-hidden bg-muted/50 py-24 md:py-32" id="how-it-works">
        <HoneycombPattern className="absolute inset-0 text-primary/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Three steps to <span className="text-accent">real reviews</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether you&apos;re a customer or business owner, getting started is simple.
            </p>
          </motion.div>

          {/* For Customers */}
          <motion.div variants={fadeUp} className="mt-16">
            <h3 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-accent">
              For Customers
            </h3>
            <div className="grid gap-12 md:grid-cols-3">
              <StepCard
                step={1}
                icon={Smartphone}
                title="Sign Up & Set Interests"
                description="Create your account and select the business categories you care about. Your feed personalizes instantly."
              />
              <StepCard
                step={2}
                icon={Play}
                title="Watch Real POVs"
                description="Browse authentic video reviews from real customers. See star ratings, recommendations, and honest experiences."
              />
              <StepCard
                step={3}
                icon={ShoppingBag}
                title="Shop & Connect"
                description="Found something you love? Browse the product shelf, message the business, and order directly in-app."
              />
            </div>
          </motion.div>

          {/* For Businesses */}
          <motion.div variants={fadeUp} className="mt-20">
            <h3 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-accent">
              For Businesses
            </h3>
            <div className="grid gap-12 md:grid-cols-3">
              <StepCard
                step={1}
                icon={Zap}
                title="Create Your Profile"
                description="List your business with category, location, operating hours, and a QR code for easy customer check-ins."
              />
              <StepCard
                step={2}
                icon={ShoppingBag}
                title="Build Your Shelf"
                description="Add products and services with images, pricing, and stock. Manage everything from your dashboard."
              />
              <StepCard
                step={3}
                icon={TrendingUp}
                title="Grow With Trust"
                description="Earn visibility through genuine customer POVs and keep your public profile sharp."
              />
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── TESTIMONIALS ─── */}
      <AnimatedSection className="py-24 md:py-32" id="testimonials">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Loved by the <span className="text-accent">community</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              See what early users and business owners are saying about BuzzMap.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <TestimonialCard
              name="Amina Wanjiku"
              role="Customer, Nairobi"
              initials="AW"
              rating={5}
              content="I finally trust the reviews I see. The video POVs show exactly what you get — no filters, no fake text. I discovered my favourite salon through BuzzMap!"
            />
            <TestimonialCard
              name="David Ochieng"
              role="Restaurant Owner, Mombasa"
              initials="DO"
              rating={5}
              content="Since listing on BuzzMap, my bookings have increased by 40%. Customers love leaving video reviews, and it brings in new people who trust what they see."
            />
            <TestimonialCard
              name="Faith Muthoni"
              role="Customer, Kisumu"
              initials="FM"
              rating={5}
              content="The messaging feature is a game changer. I can chat with businesses before I visit, ask about availability, and even order products directly. So convenient!"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* ─── TRUST SIGNALS ─── */}
      <AnimatedSection className="border-t border-border/50 bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {[
              { icon: Shield, text: 'Verified Reviews Only' },
              { icon: CheckCircle, text: 'OWASP Secure' },
              { icon: Zap, text: 'Real-Time Updates' },
              { icon: Users, text: 'Community Driven' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4 text-accent" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FINAL CTA ─── */}
      <section className="relative overflow-hidden bg-primary py-24 md:py-32">
        <HoneycombPattern className="absolute inset-0 text-white/[0.04]" />
        <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-accent/15 blur-[100px]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-primary-foreground md:text-5xl"
          >
            Ready to discover what&apos;s{' '}
            <span className="text-accent">real</span>?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg text-primary-foreground/70"
          >
            Join thousands of users who trust BuzzMap for authentic business
            discovery. No fake reviews. No guesswork. Just real experiences
            shared by real people.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="bg-accent text-white hover:bg-[oklch(0.68_0.17_65)] shadow-lg shadow-accent/25 hover:shadow-xl active:scale-[0.98] transition-all"
              nativeButton={false}
              render={<Link href={appRoutes.auth.registerCustomer} />}
            >
              Join as Customer
              <ArrowRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              nativeButton={false}
              render={<Link href={appRoutes.auth.registerBusiness} />}
            >
              <ShoppingBag data-icon="inline-start" />
              Register Your Business
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <Hexagon className="size-6 text-accent" />
                <span className="text-lg font-bold text-primary">BuzzMap</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                A trust-driven marketplace for East Africa.{' '}
                <span className="text-accent font-medium">for you by you</span>
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href={appRoutes.customer.feed} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explore Feed</Link></li>
                <li><Link href={appRoutes.customer.search} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Search Businesses</Link></li>
                <li><Link href={appRoutes.customer.povCreate} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create a POV</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Business</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href={appRoutes.auth.registerBusiness} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Register Business</Link></li>
                <li><Link href={appRoutes.business.dashboard} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href={appRoutes.business.settings} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Settings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Account</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href={appRoutes.auth.login} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href={appRoutes.auth.registerCustomer} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
                <li><Link href={appRoutes.auth.forgotPassword} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reset Password</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BuzzMap. All rights reserved.
            </p>
            <div className="flex gap-6">
              <LegalDocumentDialog kind="terms" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

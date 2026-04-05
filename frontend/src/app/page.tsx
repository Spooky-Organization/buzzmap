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
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/register/customer" />}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-primary">
        {/* Honeycomb overlay */}
        <HoneycombPattern className="absolute inset-0 text-white/[0.04]" />

        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-accent/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
              Launching in East Africa
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-7xl"
          >
            Discover Real Businesses.{' '}
            <span className="text-accent">Real Reviews.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl text-lg leading-relaxed text-primary-foreground/70 md:text-xl"
          >
            BuzzMap kills fake reviews by replacing static text with lived-moment
            video POVs from real customers. See it, believe it, support it.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-2xl font-semibold tracking-wide text-accent md:text-3xl"
          >
            for you by you
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="bg-accent text-white hover:bg-[oklch(0.68_0.17_65)] shadow-lg shadow-accent/25 hover:shadow-xl active:scale-[0.98] transition-all"
              nativeButton={false}
              render={<Link href="/register/customer" />}
            >
              Start Exploring
              <ArrowRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              nativeButton={false}
              render={<Link href="/register/business" />}
            >
              <Play className="mr-2 size-4" />
              List Your Business
            </Button>
          </motion.div>

          {/* Floating phone mockup hint */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mt-8 w-full max-w-3xl"
          >
            <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-accent/20 backdrop-blur-sm">
                  <Play className="size-7 text-accent" />
                </div>
                <p className="text-sm font-medium text-primary-foreground/60">Watch how BuzzMap works</p>
              </div>
              {/* Decorative UI elements */}
              <div className="absolute left-4 top-4 flex gap-2">
                <div className="size-3 rounded-full bg-white/20" />
                <div className="size-3 rounded-full bg-white/20" />
                <div className="size-3 rounded-full bg-white/20" />
              </div>
            </div>
          </motion.div>
        </div>
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
              description="Authentic video reviews from real customers. No scripts, no fakes — just lived moments that show the real experience."
            />
            <FeatureCard
              icon={Shield}
              title="Trust-Driven"
              description="Star ratings, recommendation scores, and verified customer status ensure every review you see is genuine."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Real-Time Messaging"
              description="Chat directly with businesses before you buy. Ask questions, negotiate, and get instant responses."
            />
            <FeatureCard
              icon={ShoppingBag}
              title="Product Shelf"
              description="Browse products and services from local businesses. Add to cart and order seamlessly within the app."
            />
            <FeatureCard
              icon={MapPin}
              title="Local Discovery"
              description="Find businesses in your area with interest-based feeds and trending POVs from your community."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Business Analytics"
              description="Business owners get real-time insights on reviews, followers, and engagement to grow their brand."
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
                description="Earn visibility through genuine customer POVs. Track analytics, followers, and engagement in real time."
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
              render={<Link href="/register/customer" />}
            >
              Join as Customer
              <ArrowRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              nativeButton={false}
              render={<Link href="/register/business" />}
            >
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
                <li><Link href="/feed" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explore Feed</Link></li>
                <li><Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Search Businesses</Link></li>
                <li><Link href="/pov/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create a POV</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Business</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="/register/business" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Register Business</Link></li>
                <li><Link href="/business/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/business/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Account</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/register/customer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
                <li><Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reset Password</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BuzzMap. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

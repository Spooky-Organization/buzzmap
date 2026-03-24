import {
  NavBar,
  HeroSection,
  FeaturesGrid,
  SecuritySection,
  ArchitectureSection,
  QuickStartSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <main className="bg-gray-900">
        <HeroSection />
        <FeaturesGrid />
        <SecuritySection />
        <ArchitectureSection />
        <QuickStartSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

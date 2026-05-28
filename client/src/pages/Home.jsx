import HeroSection from '../components/homepage/HeroSection';
import HowItWorks from '../components/homepage/HowItWorks';
import ComparisonSection from '../components/homepage/ComparisonSection';
import PassportShowcase from '../components/homepage/PassportShowcase';
import FinalCTA from '../components/homepage/FinalCTA';
import '../components/homepage/homepage.css';

export default function Home() {
  return (
    <div className="homepage-wrapper">
      <HeroSection />
      <HowItWorks />
      <ComparisonSection />
      <PassportShowcase />
      <FinalCTA />
    </div>
  );
}

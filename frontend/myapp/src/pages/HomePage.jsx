import HeroSection from "../components/hero/HeroSection.jsx";
import FeaturedFleet from "../components/home/FeaturedFleet/FeaturedFleet.jsx";
import BrandStory from "../components/home/BrandStory/BrandStory.jsx";
import VehicleCategories from "../components/home/VehicleCategories/VehicleCategories.jsx";
import WhyZipree from "../components/home/WhyZipree/WhyZipree.jsx";
import HowItWorks from "../components/home/HowItWorks/HowItWorks.jsx";
import Testimonials from "../components/home/Testimonials/Testimonials.jsx";
import Newsletter from "../components/home/Newsletter/Newsletter.jsx";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedFleet />
      <BrandStory />
      <VehicleCategories />
      <WhyZipree />
      <HowItWorks />
      <Testimonials />
    </main>
  );
}
import { Hero } from "@/components/sections/Hero";
import { WhatIsCiro } from "@/components/sections/WhatIsCiro";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturedCities } from "@/components/sections/FeaturedCities";
import { Investor } from "@/components/sections/Investor";
import { Waitlist } from "@/components/sections/Waitlist";
import { Vision } from "@/components/sections/Vision";
import { softwareAppJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd()) }}
      />
      <Hero />
      <WhatIsCiro />
      <HowItWorks />
      <FeaturedCities />
      <Waitlist />
      <Investor />
      <Vision />
    </>
  );
}

import { HeroBalloons } from "@/components/sections/HeroBalloons";
import { ActsSpine } from "@/components/sections/ActsSpine";
import { Finale } from "@/components/sections/Finale";
import { Waitlist } from "@/components/sections/Waitlist";
import { loadStories, pickFeaturedPerCategory } from "@/lib/stories";
import { softwareAppJsonLd } from "@/lib/seo";

// Revalidate the homepage every 60s so newly-published stories surface
// without a full redeploy. The /api/revalidate webhook can also trigger
// instant invalidation from a Firestore change function.
export const revalidate = 60;

export default async function HomePage() {
  const stories = await loadStories();
  const acts = pickFeaturedPerCategory(stories);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd()) }}
      />
      <HeroBalloons />
      <ActsSpine acts={acts} />
      <Finale />
      <Waitlist />
    </>
  );
}

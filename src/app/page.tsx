import { Hero } from "@/frontend/components/home/hero";
import { QuickServices } from "@/frontend/components/home/quick-services";
import { LatestNews } from "@/frontend/components/features/latest-news";
import { Announcements } from "@/frontend/components/features/announcements";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickServices />
      <LatestNews />
      <Announcements />
    </>
  );
}

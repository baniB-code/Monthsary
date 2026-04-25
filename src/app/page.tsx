import { fetchMemories } from "../../lib/supabase";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { AnimatedSection } from "@/components/AnimatedSection";
import DoodleBackground from "@/components/DoodleBackground";
import { EnvelopeLetter } from "@/components/EnvelopeLetter";
import { FloatingMusicPlayer } from "@/components/FloatingMusicPlayer";
import { RelationshipCounter } from "@/components/RelationshipCounter";
import { SectionTitle } from "@/components/SectionTitle";
import { fallbackMemories, siteContent } from "@/lib/site-content";

export default async function Home() {
  let memories = fallbackMemories;
  let collageImages: string[] = [];

  try {
    const fetchedMemories = await fetchMemories();
    if (fetchedMemories.length > 0) {
      memories = fetchedMemories;
    }
  } catch {
    // Fallback content keeps the page beautiful even if backend is unavailable.
  }

  try {
    const collageDir = path.join(process.cwd(), "public", "collage");
    const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    const files = await readdir(collageDir);
    collageImages = files
      .filter((file) => allowedExt.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `/collage/${file}`);
  } catch {
    // If collage folder is missing, fallback to memory images.
  }

  const heroPhotoPool = collageImages.length > 0 ? collageImages : memories.map((memory) => memory.image_url);
  const heroPhotos = [...heroPhotoPool.slice(2), ...heroPhotoPool.slice(0, 2)].slice(0, 6);

  return (
    <div className="romantic-page relative overflow-hidden text-rose-950">
      <div className="pointer-events-none absolute inset-0 romantic-bg opacity-70" />
      <DoodleBackground />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-28 sm:px-8">
        <AnimatedSection className="relative min-h-[92vh] content-center py-20 text-center sm:py-24">
          <div className="hero-glow" />
          <div className="romantic-panel stitched relative mx-auto mb-8 w-full rounded-[2rem] px-4 pt-10 pb-8 sm:px-8">
            <div className="absolute top-6 left-4 h-16 w-16 rotate-[-10deg] rounded-sm border border-amber-200/80 bg-amber-50/85 p-2 text-left text-[10px] leading-snug text-amber-900 shadow-sm sm:left-10 sm:h-20 sm:w-20 sm:text-xs">
              Kahit malayo, ikaw pa rin palagi.
            </div>
            <div className="absolute top-6 right-4 h-16 w-16 rotate-[9deg] rounded-sm border border-amber-200/80 bg-amber-50/85 p-2 text-left text-[10px] leading-snug text-amber-900 shadow-sm sm:right-10 sm:h-20 sm:w-20 sm:text-xs">
              Next cuddle soon, mahal.
            </div>

            <p className="mb-4 inline-block rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase text-rose-500">
            {siteContent.hero.yourName} + {siteContent.hero.partnerName}
            </p>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-rose-950 sm:text-6xl">
              {siteContent.hero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-rose-700 sm:text-xl">{siteContent.hero.subtitle}</p>
            <p className="mx-auto mt-3 max-w-3xl text-rose-700/90">{siteContent.hero.intro}</p>

            <div className="pointer-events-none mx-auto mt-8 h-[2px] w-[92%] max-w-4xl rounded-full bg-gradient-to-r from-amber-300/30 via-amber-600/60 to-amber-300/30" />

            <div className="relative mx-auto mt-8 w-full px-1 sm:px-2">
              <div className="pointer-events-none absolute top-4 left-2 right-2 h-[2px] rounded-full bg-amber-800/50 sm:left-6 sm:right-6" />
              <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 lg:grid-cols-6">
                {heroPhotos.map((imageUrl, index) => (
                  <figure
                    key={`${imageUrl}-hero-${index}`}
                    className="relative mx-auto w-full max-w-[220px]"
                    style={{ transform: `rotate(${index % 2 === 0 ? -3 : 2}deg)` }}
                  >
                    <span className="absolute -top-2 left-1/2 z-30 h-7 w-5 -translate-x-1/2 rounded-sm bg-amber-700/75 shadow-sm" />
                    <div className="polaroid overflow-hidden rounded-sm bg-white shadow-md">
                      <img
                        src={imageUrl}
                        alt={`Memory ${index + 1}`}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    </div>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-14">
          <SectionTitle
            eyebrow="Our Collage"
            title="Our Pictures Together"
            subtitle="(for relapse purposes)"
          />

          <div className="romantic-panel stitched relative mx-auto rounded-[1.7rem] p-5 sm:p-7">
            <div className="floral-corner top-left" />
            <div className="floral-corner bottom-right" />
            <div className="mx-auto columns-2 gap-4 space-y-4 sm:columns-3 lg:columns-4">
            {(collageImages.length > 0 ? collageImages : memories.map((memory) => memory.image_url)).map(
              (imageUrl, index) => (
                <figure
                  key={`${imageUrl}-${index}`}
                  className="polaroid washi-tape break-inside-avoid overflow-hidden rounded-2xl"
                >
                  <img
                    src={imageUrl}
                    alt={`Collage photo ${index + 1}`}
                    className="w-full object-cover transition duration-500 hover:scale-105"
                  />
                </figure>
              ),
            )}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-14">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {["I", "LOVE", "YOU,", "SON"].map((word) => (
              <article
                key={word}
                className="paper-note relative rounded-2xl p-8 text-center"
              >
                <p className="text-2xl font-semibold tracking-wide text-rose-700">{word}</p>
              </article>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-14">
          <SectionTitle eyebrow="Love Letter" title={siteContent.loveLetter.title} />
          <div className="romantic-panel mx-auto rounded-[1.7rem] p-3 sm:p-4">
            <EnvelopeLetter title={siteContent.loveLetter.title} body={siteContent.loveLetter.body} />
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-14">
          <SectionTitle
            eyebrow="Countdown"
            title="Our Next Cuddle Time"
            subtitle="get ready!!!!!"
          />
          <div className="romantic-panel stitched mx-auto max-w-3xl rounded-3xl p-6">
            <RelationshipCounter targetDate="2026-05-19T00:00:00+08:00" />
          </div>
        </AnimatedSection>

      </main>

      <FloatingMusicPlayer
        title={siteContent.music.title}
        artist={siteContent.music.artist}
        audioUrl={siteContent.music.url}
      />
    </div>
  );
}

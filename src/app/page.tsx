import { fetchMemories } from "../../lib/supabase";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AddPhotosGallery } from "@/components/AddPhotosGallery";
import DoodleBackground from "@/components/DoodleBackground";
import { EnvelopeLetter } from "@/components/EnvelopeLetter";
import { FloatingMusicPlayer } from "@/components/FloatingMusicPlayer";
import { RelationshipCounter } from "@/components/RelationshipCounter";
import { SectionTitle } from "@/components/SectionTitle";
import { fallbackMemories, siteContent } from "@/lib/site-content";

export default async function Home() {
  let memories = fallbackMemories;
  let collageImages: string[] = [];
  let telegramBgImages: string[] = [];

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

  try {
    const telegramBgDir = path.join(process.cwd(), "public", "telegram-bg");
    const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    const files = await readdir(telegramBgDir);
    const uniqueMomentFiles = new Map<string, string>();
    const sortedFiles = files
      .filter((file) => allowedExt.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const file of sortedFiles) {
      // Telegram exports many similar shots with different photo_X prefixes.
      const momentKey = file.replace(/^photo_\d+_/, "");
      if (!uniqueMomentFiles.has(momentKey)) {
        uniqueMomentFiles.set(momentKey, file);
      }
    }

    telegramBgImages = Array.from(uniqueMomentFiles.values()).map(
      (file) => `/telegram-bg/${file}`,
    );
  } catch {
    // If telegram-bg folder is missing, keep decorative background fallback.
  }

  const heroPhotoPool = collageImages.length > 0 ? collageImages : memories.map((memory) => memory.image_url);
  const heroPhotos = [...heroPhotoPool.slice(2), ...heroPhotoPool.slice(0, 2)].slice(0, 6);

  return (
    <div className="romantic-page relative min-h-screen overflow-hidden text-rose-950">
      <div className="pointer-events-none absolute inset-x-0 -top-[2%] -bottom-[35%] romantic-bg opacity-70" />
      <DoodleBackground imageUrls={telegramBgImages} />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-28 sm:px-8">
        <AnimatedSection className="section-block pt-12 sm:pt-16">
          <FloatingMusicPlayer
            title={siteContent.music.title}
            artist={siteContent.music.artist}
            audioUrl={siteContent.music.url}
          />
        </AnimatedSection>
        <div className="section-divider" aria-hidden="true">
          <span>♡</span>
          <span>✿</span>
          <span>♡</span>
        </div>

        <AnimatedSection className="section-block relative min-h-[92vh] content-center text-center">
          <div className="hero-glow" />
          <div className="relative left-1/2 right-1/2 mb-8 w-screen -translate-x-1/2 px-3 sm:px-6 lg:px-10">
          <div className="romantic-panel stitched relative mx-auto w-full rounded-[2.2rem] px-5 pt-12 pb-10 sm:px-10">
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
          </div>
        </AnimatedSection>
        <div className="section-divider" aria-hidden="true">
          <span>❥</span>
          <span>✿</span>
          <span>❥</span>
        </div>

        <AnimatedSection className="section-block">
          <div className="relative">
            <span className="floating-note floating-note-soft left-[6%] top-2 rotate-[-7deg]">
              more us pics
            </span>
            <span className="floating-note floating-note-soft right-[8%] top-4 rotate-[8deg]">
              cute dump
            </span>
            <SectionTitle
              eyebrow="Our Collage"
              title="Our Online Album"
              subtitle="upload mo dito mga pictures natin mahal, for relapse purposes"
              asCard
            />
          </div>
          <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-3 sm:px-6 lg:px-10">
            <AddPhotosGallery initialImages={collageImages.length > 0 ? collageImages : memories.map((memory) => memory.image_url)} />
          </div>
        </AnimatedSection>
        <div className="section-divider" aria-hidden="true">
          <span>♡</span>
          <span>✿</span>
          <span>♡</span>
        </div>

        <AnimatedSection className="section-block">
          <div className="love-phrase-wrap relative mx-auto max-w-5xl">
            <span className="floating-note left-[-4%] top-[22%] rotate-[-11deg]">forever</span>
            <span className="floating-note right-[-2%] top-[30%] rotate-[10deg]">my home</span>
            <div className="love-phrase-glow" />
            <span className="love-float-heart love-heart-1">❤</span>
            <span className="love-float-heart love-heart-2">♡</span>
            <span className="love-float-heart love-heart-3">❤</span>
            <span className="love-float-heart love-heart-4">♡</span>
            <div className="love-phrase-grid mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            {["EVANN", "❤", "ALYSON"].map((word, index) => (
              <article
                key={word}
                className="paper-note luxury-card love-word-card relative rounded-[1.4rem] p-10 text-center sm:p-11"
                style={{ transform: `rotate(${[-3, 1, 3][index]}deg)` }}
              >
                <span className="love-card-pin" />
                <p className="love-word text-2xl font-semibold tracking-wide text-rose-700">{word}</p>
                <span className="love-card-sparkle">✦</span>
              </article>
            ))}
            </div>
          </div>
        </AnimatedSection>
        <div className="section-divider" aria-hidden="true">
          <span>❥</span>
          <span>✿</span>
          <span>❥</span>
        </div>

        <AnimatedSection className="section-block">
          <SectionTitle eyebrow="Love Letter" title={siteContent.loveLetter.title} />
          <div className="romantic-panel relative mx-auto rounded-[1.9rem] p-4 sm:p-6">
            <span className="floating-note floating-note-soft left-6 top-5 rotate-[-8deg]">
              write me
            </span>
            <span className="floating-note floating-note-soft right-6 top-5 rotate-[8deg]">
              keep this
            </span>
            <EnvelopeLetter title={siteContent.loveLetter.title} body={siteContent.loveLetter.body} />
          </div>
        </AnimatedSection>
        <div className="section-divider" aria-hidden="true">
          <span>♡</span>
          <span>✿</span>
          <span>♡</span>
        </div>

        <AnimatedSection className="section-block">
          <SectionTitle
            eyebrow="Countdown"
            title="Our Next Cuddle Time"
            subtitle="get ready!!!!!"
          />
          <div className="romantic-panel stitched relative mx-auto max-w-4xl rounded-[2rem] p-7 sm:p-9">
            <span className="floating-note left-6 top-4 rotate-[-8deg]">soon</span>
            <span className="floating-note right-6 top-4 rotate-[7deg]">can't wait</span>
            <RelationshipCounter targetDate="2026-05-19T00:00:00+08:00" />
          </div>
        </AnimatedSection>

      </main>

    </div>
  );
}

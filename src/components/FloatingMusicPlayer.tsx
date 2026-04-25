"use client";

import { useEffect, useRef } from "react";

type FloatingMusicPlayerProps = {
  title: string;
  artist: string;
  audioUrl: string;
};

export function FloatingMusicPlayer({
  title,
  artist,
  audioUrl,
}: FloatingMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const tryPlay = () => {
      audioEl.play().catch(() => {
        // Ignore autoplay rejections; next interaction will try again.
      });
    };

    // Most browsers require a user interaction before audio can start.
    const interactionEvents: Array<keyof WindowEventMap> = [
      "click",
      "scroll",
      "keydown",
      "touchstart",
    ];

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, tryPlay, { once: true, passive: true });
    });

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, tryPlay);
      });
    };
  }, [audioUrl]);

  return (
    <section className="music-player-section stitched relative mx-auto mb-12 overflow-hidden rounded-[2rem] p-6 sm:p-9">
      <span className="floating-note floating-note-soft left-5 top-5 rotate-[-8deg]">our song</span>
      <span className="floating-note floating-note-soft right-5 top-5 rotate-[9deg]">play me</span>
      <div className="music-player-glow" />
      <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-flex items-center rounded-full border border-rose-200/80 bg-white/85 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-rose-500">
            Our Soundtrack
          </p>
          <div className="music-decorative-icons mt-4" aria-hidden="true">
            <span>♪</span>
            <span>♡</span>
            <span>♫</span>
            <span>✿</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-rose-950 sm:text-3xl">theme song natin</h2>
          <p className="mt-2 text-rose-700/90">
            "Kalapastangan ang 'di ka ibigin, Kalokohan ang 'di ka isipin."
          </p>
        </div>
        <div className="music-player-card rounded-[1.4rem] p-5 sm:p-6">
          <p className="text-sm font-medium text-rose-500">Current song</p>
          <p className="mt-1 text-lg font-semibold text-rose-900">{title}</p>
          <p className="text-sm text-rose-600">{artist}</p>
          <audio ref={audioRef} controls autoPlay loop className="mt-4 w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </section>
  );
}

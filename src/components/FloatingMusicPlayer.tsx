"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(true);
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
    <div className="fixed right-4 bottom-4 z-50 w-[min(92vw,360px)]">
      <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white/90 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="font-semibold text-rose-700">Music for Us</span>
          <span className="text-rose-500">{isOpen ? "Hide" : "Show"}</span>
        </button>

        {isOpen ? (
          <div className="space-y-3 border-t border-rose-100 px-4 py-4">
            <div>
              <p className="font-medium text-rose-900">{title}</p>
              <p className="text-sm text-rose-500">{artist}</p>
            </div>
            <audio ref={audioRef} controls autoPlay loop className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : null}
      </div>
    </div>
  );
}

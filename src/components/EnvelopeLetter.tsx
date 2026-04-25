"use client";

import { useState } from "react";

type EnvelopeLetterProps = {
  title: string;
  body: string;
};

export function EnvelopeLetter({ title, body }: EnvelopeLetterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-rose-200 bg-white/80 p-4 shadow-lg sm:p-6">
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            {isOpen ? "Close" : "Open"}
          </button>
        </div>
        <p className="mb-5 text-center text-sm text-rose-500">Tap the envelope to {isOpen ? "close" : "open"}.</p>

        <button
          type="button"
          aria-label={isOpen ? "Close envelope letter" : "Open envelope letter"}
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative mx-auto block w-full max-w-xl cursor-pointer rounded-2xl focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
          style={{ perspective: "1400px" }}
        >
          <div
            className={`relative overflow-hidden rounded-2xl border border-rose-300 bg-rose-100/70 shadow-inner transition-[height] duration-700 ${
              isOpen ? "h-[420px] sm:h-[500px]" : "h-[320px]"
            }`}
          >
            <div
              className={`absolute top-6 right-6 z-50 rounded-full border border-rose-300 bg-white/85 px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm transition ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            >
              For You ♡
            </div>

            <div
              className={`absolute inset-x-8 top-8 rounded-xl border border-rose-200 bg-white px-5 py-6 text-left shadow-md transition-all duration-700 ${
                isOpen ? "z-40 -translate-y-2 opacity-100" : "z-20 translate-y-24 opacity-0"
              }`}
            >
              <p className="text-center text-xl font-semibold text-rose-800">{title}</p>
              <p className="mt-4 max-h-[300px] overflow-y-auto whitespace-pre-line pr-1 text-center leading-8 text-rose-700 sm:max-h-[360px]">
                {body}
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-rose-200/85" />
            <div
              className={`absolute bottom-0 left-0 h-0 w-0 border-b-[160px] border-l-[190px] border-b-rose-300 border-l-transparent transition-all duration-700 sm:border-l-[250px] ${
                isOpen ? "z-30 opacity-90" : "z-20 opacity-100"
              }`}
            />
            <div
              className={`absolute right-0 bottom-0 h-0 w-0 border-r-[190px] border-b-[160px] border-r-transparent border-b-rose-300 transition-all duration-700 sm:border-r-[250px] ${
                isOpen ? "z-30 opacity-90" : "z-20 opacity-100"
              }`}
            />

            <div
              className="absolute inset-x-0 top-0 z-30 origin-top transition-transform duration-700"
              style={{
                transformStyle: "preserve-3d",
                transform: isOpen ? "rotateX(-180deg)" : "rotateX(0deg)",
              }}
            >
              <div className="h-0 w-0 border-t-[145px] border-r-[210px] border-l-[210px] border-t-rose-300 border-r-transparent border-l-transparent sm:border-r-[290px] sm:border-l-[290px]" />
            </div>
            <div
              className={`absolute inset-x-0 top-[118px] z-40 flex justify-center transition-all duration-500 ${
                isOpen ? "-translate-y-16 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-lg text-rose-500 shadow">
                ❤
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rose-200/80 to-transparent" />
          </div>
        </button>
      </div>
    </div>
  );
}

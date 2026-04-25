"use client";

import { useEffect, useMemo, useState } from "react";

type EnvelopeLetterProps = {
  title: string;
  body: string;
};

type LoveLetter = {
  id: string;
  title: string;
  body: string;
  author: string;
  created_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function EnvelopeLetter({ title, body }: EnvelopeLetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letters, setLetters] = useState<LoveLetter[]>([
    {
      id: "seed-letter",
      title,
      body,
      author: "Us",
      created_at: new Date().toISOString(),
    },
  ]);
  const [selectedLetterId, setSelectedLetterId] = useState("seed-letter");
  const [authorInput, setAuthorInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");

  const canPersist = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

  const selectedLetter = useMemo(
    () => letters.find((letter) => letter.id === selectedLetterId) ?? letters[0],
    [letters, selectedLetterId],
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!canPersist) return;
    let isMounted = true;

    const fetchLetters = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/love_letters?select=id,title,body,author,created_at&order=created_at.desc`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as LoveLetter[];
        if (!isMounted || data.length === 0) return;

        setLetters((prev) => {
          const seeded = prev.find((letter) => letter.id === "seed-letter");
          const merged = seeded ? [...data, seeded] : data;
          return merged;
        });
        setSelectedLetterId(data[0].id);
      } catch {
        // Keep seeded fallback when table/config is unavailable.
      }
    };

    fetchLetters();

    return () => {
      isMounted = false;
    };
  }, [canPersist]);

  const handleSaveLetter = async () => {
    const author = authorInput.trim() || "Us";
    const letterTitle = titleInput.trim();
    const letterBody = bodyInput.trim();

    if (!letterTitle || !letterBody) {
      setError("Please add a title and your letter message.");
      return;
    }

    setError(null);
    setIsSaving(true);

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const localLetter: LoveLetter = {
      id: localId,
      title: letterTitle,
      body: letterBody,
      author,
      created_at: new Date().toISOString(),
    };

    setLetters((prev) => [localLetter, ...prev]);
    setSelectedLetterId(localId);
    setAuthorInput("");
    setTitleInput("");
    setBodyInput("");

    if (canPersist) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/love_letters`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            title: letterTitle,
            body: letterBody,
            author,
          }),
        });

        if (response.ok) {
          const inserted = ((await response.json()) as LoveLetter[])[0];
          if (inserted?.id) {
            setLetters((prev) => prev.map((letter) => (letter.id === localId ? inserted : letter)));
            setSelectedLetterId(inserted.id);
          }
        }
      } catch {
        // Local state already updated; keep experience smooth.
      }
    }

    setIsSaving(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="luxury-card rounded-[2rem] border border-rose-200/85 bg-white/82 p-5 shadow-xl backdrop-blur-sm sm:p-8">
        <div className="mb-6 rounded-2xl border border-rose-200/70 bg-white/65 p-3 sm:p-4">
          <button
            type="button"
            onClick={() => setIsComposerOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-left"
          >
            <p className="text-sm font-semibold text-rose-700/90">Write a new letter</p>
            <span className="rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-semibold text-rose-600">
              {isComposerOpen ? "Hide" : "Write"}
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isComposerOpen ? "mt-3 max-h-[480px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={authorInput}
                onChange={(event) => setAuthorInput(event.target.value)}
                placeholder="From (Ban / Son)"
                className="rounded-xl border border-rose-200 bg-white/90 px-3 py-2 text-sm text-rose-800 outline-none focus:border-rose-400"
              />
              <input
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
                placeholder="Letter title"
                className="rounded-xl border border-rose-200 bg-white/90 px-3 py-2 text-sm text-rose-800 outline-none focus:border-rose-400"
              />
            </div>
            <textarea
              value={bodyInput}
              onChange={(event) => setBodyInput(event.target.value)}
              placeholder="Write your letter here..."
              rows={4}
              className="mt-3 w-full rounded-xl border border-rose-200 bg-white/90 px-3 py-2 text-sm text-rose-800 outline-none focus:border-rose-400"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-rose-500">Tip: pwede mo lang i-stack letters natin dito</p>
              <button
                type="button"
                onClick={handleSaveLetter}
                disabled={isSaving}
                className="btn-primary px-5 py-2 text-sm disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save letter"}
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="mb-4 text-sm text-rose-700">{error}</p> : null}

        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {letters.map((letter, index) => (
            <button
              key={letter.id}
              type="button"
              onClick={() => {
                setSelectedLetterId(letter.id);
                setIsOpen(false);
              }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selectedLetter?.id === letter.id
                  ? "border-rose-400 bg-rose-100 text-rose-700"
                  : "border-rose-200 bg-white/85 text-rose-600 hover:border-rose-300"
              }`}
            >
              {letter.author} - {letter.title.length > 18 ? `${letter.title.slice(0, 18)}...` : letter.title}
              {index === 0 ? " ✨" : ""}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="btn-primary px-5 py-2 text-sm"
          >
            {isOpen ? "Close" : "Open"}
          </button>
        </div>
        <p className="mb-5 text-center text-sm text-rose-500">
          Tap the envelope to {isOpen ? "close" : "open"} {selectedLetter ? `"${selectedLetter.title}"` : "the letter"}.
        </p>

        <button
          type="button"
          aria-label={isOpen ? "Close envelope letter" : "Open envelope letter"}
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative mx-auto block w-full max-w-xl cursor-pointer rounded-2xl focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
          style={{ perspective: "1400px" }}
        >
          <div
            className={`luxury-card relative overflow-hidden rounded-[1.5rem] border border-rose-300/85 bg-rose-100/74 shadow-inner transition-[height] duration-700 ${
              isOpen ? "h-[420px] sm:h-[500px]" : "h-[320px]"
            }`}
          >
            <div
              className={`absolute top-6 right-6 z-50 rounded-full border border-rose-300 bg-white/88 px-3.5 py-1.5 text-xs font-semibold text-rose-600 shadow-md transition ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            >
              For You ♡
            </div>

            <div
              className={`luxury-card absolute inset-x-8 top-8 rounded-2xl border border-rose-200 bg-white/96 px-6 py-7 text-left shadow-lg transition-all duration-700 ${
                isOpen ? "z-40 -translate-y-4 scale-100 opacity-100" : "z-20 translate-y-24 scale-[0.96] opacity-0"
              }`}
            >
              <p className="text-center text-xs font-semibold tracking-[0.18em] uppercase text-rose-500">
                From {selectedLetter?.author ?? "Us"}
              </p>
              <p className="mt-2 text-center text-xl font-semibold text-rose-800">
                {selectedLetter?.title ?? title}
              </p>
              <p className="mt-4 max-h-[300px] overflow-y-auto whitespace-pre-line pr-1 text-center leading-8 text-rose-700 sm:max-h-[360px]">
                {selectedLetter?.body ?? body}
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

      {isOpen ? (
        <div className="letter-fullscreen-overlay" onClick={() => setIsOpen(false)}>
          <div className="letter-fullscreen-paper luxury-card" onClick={(event) => event.stopPropagation()}>
            <span className="letter-stamp">Forever Us</span>
            <span className="letter-doodle letter-doodle-1">♡</span>
            <span className="letter-doodle letter-doodle-2">❤</span>
            <div className="letter-unfold-content">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-rose-500">
                  From {selectedLetter?.author ?? "Us"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary px-3 py-1 text-xs"
                >
                  Close
                </button>
              </div>
              <p className="text-center text-2xl font-semibold text-rose-900 sm:text-3xl">
                {selectedLetter?.title ?? title}
              </p>
              <p className="mt-5 max-h-[62vh] overflow-y-auto whitespace-pre-line pr-1 text-center text-lg leading-9 text-rose-700">
                {selectedLetter?.body ?? body}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

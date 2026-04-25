"use client";

type DoodleBackgroundProps = {
  imageUrls: string[];
};

export default function DoodleBackground({ imageUrls = [] }: DoodleBackgroundProps) {
  const tileVariants = [
    "photo-bg-tile-sm",
    "photo-bg-tile-md",
    "photo-bg-tile-lg",
    "photo-bg-tile-tall",
    "photo-bg-tile-wide",
    "photo-bg-tile-portrait",
    "photo-bg-tile-square",
    "photo-bg-tile-long",
  ];
  const baseImages = imageUrls.slice(0, 24);
  const collageImages =
    baseImages.length > 0
      ? Array.from({ length: 520 }, (_, index) => baseImages[index % baseImages.length])
      : [];

  const getDriftClass = (index: number) => {
    if (index % 7 === 0) return "photo-bg-drift-a";
    if (index % 9 === 0) return "photo-bg-drift-b";
    if (index % 11 === 0) return "photo-bg-drift-c";
    return "";
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 -top-[2%] -bottom-[35%] z-0 overflow-hidden">
      {collageImages.length > 0 ? (
        <>
          <div className="photo-bg-grid">
            {collageImages.map((imageUrl, index) => (
              <figure
                key={`${imageUrl}-bg-${index}`}
                className={`photo-bg-tile ${tileVariants[index % tileVariants.length]} ${getDriftClass(index)}`}
              >
                <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>
          <div className="photo-bg-overlay" />
          <div className="photo-bg-vignette" />
        </>
      ) : null}

      {/* soft blur blobs */}
      <div className="absolute top-[-100px] left-[-80px] h-80 w-80 rounded-full bg-[#d6c2a1]/40 blur-3xl animate-pulse" />
      <div className="absolute right-[-80px] bottom-[-100px] h-96 w-96 rounded-full bg-[#cfa18d]/30 blur-3xl animate-pulse" />

      {/* doodles */}
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        viewBox="0 0 1440 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* hearts */}
        <path
          d="M150 150 C150 120, 200 120, 200 150 C200 180, 150 210, 150 210 C150 210, 100 180, 100 150 C100 120, 150 120, 150 150Z"
          stroke="#8B5E3C"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M1200 220 C1200 190, 1250 190, 1250 220 C1250 250, 1200 280, 1200 280 C1200 280, 1150 250, 1150 220 C1150 190, 1200 190, 1200 220Z"
          stroke="#8B5E3C"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M720 520 C720 500, 750 500, 750 520 C750 540, 720 560, 720 560 C720 560, 690 540, 690 520 C690 500, 720 500, 720 520Z"
          stroke="#8B5E3C"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M280 760 C280 740, 310 740, 310 760 C310 780, 280 800, 280 800 C280 800, 250 780, 250 760 C250 740, 280 740, 280 760Z"
          stroke="#8B5E3C"
          strokeWidth="2.5"
          fill="none"
        />

        {/* stars */}
        <path
          d="M300 400 L310 430 L340 430 L315 448 L325 480 L300 460 L275 480 L285 448 L260 430 L290 430 Z"
          stroke="#8B5E3C"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M1040 420 L1048 444 L1073 444 L1052 458 L1060 484 L1040 468 L1020 484 L1028 458 L1007 444 L1032 444 Z"
          stroke="#8B5E3C"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M660 130 L668 154 L693 154 L672 168 L680 194 L660 178 L640 194 L648 168 L627 154 L652 154 Z"
          stroke="#8B5E3C"
          strokeWidth="2"
          fill="none"
        />

        {/* flowers */}
        <circle cx="1100" cy="600" r="18" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="1080" cy="600" r="10" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="1120" cy="600" r="10" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="1100" cy="580" r="10" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="1100" cy="620" r="10" stroke="#8B5E3C" strokeWidth="2" />

        <circle cx="420" cy="650" r="14" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="404" cy="650" r="8" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="436" cy="650" r="8" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="420" cy="634" r="8" stroke="#8B5E3C" strokeWidth="2" />
        <circle cx="420" cy="666" r="8" stroke="#8B5E3C" strokeWidth="2" />

        {/* swirl lines */}
        <path
          d="M0 700 Q300 600 500 700 T1000 700 T1440 650"
          stroke="#8B5E3C"
          strokeWidth="2"
          strokeDasharray="8 8"
        />
        <path
          d="M80 320 Q250 260 420 330 T760 330 T1080 300 T1380 340"
          stroke="#8B5E3C"
          strokeWidth="1.8"
          strokeDasharray="7 9"
        />

        {/* tiny sparkles */}
        <path d="M900 150 L900 170 M890 160 L910 160" stroke="#8B5E3C" strokeWidth="2" />
        <path d="M500 850 L500 870 M490 860 L510 860" stroke="#8B5E3C" strokeWidth="2" />
        <path d="M1260 760 L1260 778 M1251 769 L1269 769" stroke="#8B5E3C" strokeWidth="2" />
        <path d="M190 520 L190 538 M181 529 L199 529" stroke="#8B5E3C" strokeWidth="2" />
      </svg>
    </div>
  );
}

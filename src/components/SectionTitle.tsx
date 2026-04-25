type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  asCard?: boolean;
};

export function SectionTitle({ eyebrow, title, subtitle, asCard = false }: SectionTitleProps) {
  return (
    <div
      className={`mx-auto mb-10 max-w-2xl text-center ${asCard ? "section-title-card luxury-card rounded-[1.7rem] px-6 py-6 sm:px-8 sm:py-7" : ""}`}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold text-rose-950 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-4 text-rose-700/90">{subtitle}</p> : null}
    </div>
  );
}

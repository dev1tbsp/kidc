export default function SectionHeader({ overline, title, subtitle, align = "left" }) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-3xl"}`}>
      {overline && (
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-500 mb-3">
          {overline}
        </p>
      )}
      <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

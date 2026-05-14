/** Route-level suspense fallback — paired with Tankua sand / gold palette, no branding mark. */
export default function Loading() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-brand-sand px-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.55]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 50% -5%, rgba(245,168,0,0.12), transparent 52%), radial-gradient(ellipse 50% 38% at 100% 100%, rgba(26,15,10,0.05), transparent 48%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        <div
          className="relative h-11 w-11 shrink-0"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <span className="absolute inset-0 rounded-full border-[2px] border-brand-gold/[0.15]" aria-hidden />
          <span className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-brand-gold border-r-brand-gold/35 animate-spin motion-reduce:animate-none [animation-duration:0.92s]" />
        </div>
        <p className="font-dm text-[11px] font-medium uppercase tracking-[0.22em] text-brand-muted">
          Loading
        </p>
      </div>
    </main>
  );
}

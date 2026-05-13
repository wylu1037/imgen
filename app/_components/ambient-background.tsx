const noiseDataUri =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`,
  )

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-40 -top-40 h-168 w-2xl rounded-full bg-[radial-gradient(circle,rgba(0,117,222,0.22),transparent_62%)] blur-3xl will-change-transform animate-blob-a" />
      <div className="absolute -right-48 top-1/4 h-152 w-152 rounded-full bg-[radial-gradient(circle,rgba(247,150,60,0.16),transparent_62%)] blur-3xl will-change-transform animate-blob-b" />
      <div className="absolute -bottom-40 left-1/3 h-136 w-136 rounded-full bg-[radial-gradient(circle,rgba(0,117,222,0.10),transparent_62%)] blur-3xl will-change-transform animate-blob-c" />

      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 78%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{ backgroundImage: `url("${noiseDataUri}")` }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, transparent 60%, rgba(0,0,0,0.04) 100%)",
        }}
      />
    </div>
  );
}

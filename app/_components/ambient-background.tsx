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
  );

const stickyDots = [
  { top: "8%", left: "6%", size: 10, color: "#5645d4", delay: 0 },
  { top: "14%", left: "18%", size: 6, color: "#ff64c8", delay: 800 },
  { top: "26%", left: "9%", size: 8, color: "#dd5b00", delay: 1600 },
  { top: "70%", left: "5%", size: 7, color: "#1aae39", delay: 400 },
  { top: "82%", left: "16%", size: 9, color: "#2a9d99", delay: 2200 },
  { top: "10%", right: "8%", size: 8, color: "#f5d75e", delay: 1200 },
  { top: "22%", right: "14%", size: 6, color: "#7b3ff2", delay: 2000 },
  { top: "62%", right: "6%", size: 9, color: "#0075de", delay: 600 },
  { top: "78%", right: "18%", size: 7, color: "#ff64c8", delay: 1800 },
] as const;

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 -left-40 h-168 w-2xl rounded-full bg-[radial-gradient(circle,rgba(86,69,212,0.18),transparent_62%)] blur-3xl" />
      <div className="absolute top-1/4 -right-48 h-152 w-152 rounded-full bg-[radial-gradient(circle,rgba(255,232,212,0.55),transparent_62%)] blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 h-136 w-136 rounded-full bg-[radial-gradient(circle,rgba(230,224,245,0.55),transparent_62%)] blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,15,15,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,15,15,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 35%, black 30%, transparent 78%)",
        }}
      />

      {stickyDots.map((dot, index) => (
        <span
          key={index}
          className="animate-dot-drift absolute rounded-full opacity-70"
          style={{
            top: dot.top,
            left: "left" in dot ? dot.left : undefined,
            right: "right" in dot ? dot.right : undefined,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            animationDelay: `${dot.delay}ms`,
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: `url("${noiseDataUri}")` }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, transparent 60%, rgba(15,15,15,0.04) 100%)",
        }}
      />
    </div>
  );
}

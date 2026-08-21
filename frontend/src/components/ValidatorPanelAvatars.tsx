const COLORS = ["#0f6cbd", "#2f8fd6", "#0c5aa0", "#c9822a", "#1e8e5a", "#0a4a84"];

export default function ValidatorPanelAvatars({ count, pulsing = false }: { count: number; pulsing?: boolean }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-sm transition-all duration-300 animate-fade-in ${
            pulsing ? "animate-pulse-soft" : ""
          }`}
          style={{
            backgroundColor: COLORS[i % COLORS.length],
            marginLeft: i === 0 ? 0 : -10,
            animationDelay: `${i * 80}ms`,
            zIndex: count - i,
          }}
        >
          V{i + 1}
        </span>
      ))}
    </div>
  );
}

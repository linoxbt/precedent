const COLORS = ["#1f3a5f", "#3d6690", "#5c85ac", "#b8924a", "#82a2c1", "#2c5074"];

export default function ValidatorPanelAvatars({ count, pulsing = false }: { count: number; pulsing?: boolean }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-parchment-100 text-xs font-semibold text-parchment-100 shadow-sm transition-all duration-300 animate-fade-in ${
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

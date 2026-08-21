export default function StatusBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto flex items-center gap-4 border-t border-chrome-border bg-chrome-statusbar px-4 py-1.5 text-[11px] text-ink-muted">
      {children}
    </div>
  );
}

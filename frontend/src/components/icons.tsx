type IconProps = { className?: string };

export function FolderIcon({ className = "h-full w-full" }: IconProps) {
  return (
    <svg viewBox="0 0 48 40" className={className} fill="none">
      <path
        d="M2 8a2 2 0 0 1 2-2h13l4 4h23a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z"
        fill="#ffca6b"
      />
      <path d="M2 12h44v20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V12Z" fill="#ffd98a" />
      <path
        d="M2 8a2 2 0 0 1 2-2h13l4 4H2V8Z"
        fill="#f5b953"
      />
    </svg>
  );
}

export function DocumentIcon({ className = "h-full w-full", tone = "#0f6cbd" }: IconProps & { tone?: string }) {
  return (
    <svg viewBox="0 0 36 44" className={className} fill="none">
      <path d="M4 2h18l10 10v30a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#ffffff" stroke="#c7c7c7" />
      <path d="M22 2v8a2 2 0 0 0 2 2h8L22 2Z" fill="#e9e9e9" />
      <rect x="7" y="20" width="16" height="2.5" rx="1" fill={tone} opacity="0.75" />
      <rect x="7" y="25" width="22" height="2.5" rx="1" fill="#c7c7c7" />
      <rect x="7" y="30" width="22" height="2.5" rx="1" fill="#c7c7c7" />
      <rect x="7" y="35" width="14" height="2.5" rx="1" fill="#c7c7c7" />
    </svg>
  );
}

export function AppIconMark({ className = "h-full w-full" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect width="32" height="32" rx="6" fill="#0f6cbd" />
      <path
        d="M10 22V10h6.5a3.5 3.5 0 1 1 0 7H12"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none">
      <path d="M3.5 6 8 10.5 12.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BackIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M12 4 6 10l6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ForwardIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UpIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M10 15V5M10 5l-5 5M10 5l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RefreshIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M16 10a6 6 0 1 1-1.76-4.24M16 3v4h-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function NewFileIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M5 2h6l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 10v5M7.5 12.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function HelpIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.8 7.8a2.2 2.2 0 1 1 3.3 1.9c-.9.5-1.1.9-1.1 1.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14.3" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function ThisPcIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <rect x="2.5" y="4" width="15" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 16.5h5M10 13v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function GavelIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="m4 12 4-4M11.5 3.5l5 5-2 2-5-5 2-2ZM8 8l4-4M2 18h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WindowDots({ className = "" }: IconProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="h-3 w-3 rounded-full bg-[#ffbd44]" />
      <span className="h-3 w-3 rounded-full bg-[#00ca4e]" />
      <span className="h-3 w-3 rounded-full bg-[#ff605c]" />
    </div>
  );
}

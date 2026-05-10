import Link from "next/link";

export default function Logo({ className = "", textClassName = "text-xl", iconSize = 28 }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 select-none group ${className}`}>
      <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#FF8E53" />
            </linearGradient>
          </defs>
          <path d="M12 2L3 6V11.2C3 16.5 6.84 21.74 12 23C17.16 21.74 21 16.5 21 11.2V6L12 2Z" fill="url(#logo-grad)" />
          <path d="M8.5 10.5L6.5 12.5L8.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.5 10.5L17.5 12.5L15.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.5 8.5L10.5 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className={`${textClassName} font-bold tracking-tight text-white`}>
        DevLens <span style={{ color: "#FF6B6B" }}>AI</span>
      </span>
    </Link>
  );
}

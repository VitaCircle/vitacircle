import type { ComponentType } from "react";
import type { Vertical } from "@vitacircle/shared";

type IconProps = { size?: number; className?: string };

const defaults = { size: 28, className: "" };

export function IconUxUi({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconGraphicDesign({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20 L12 4 L20 20 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconPhotography({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 6 L10 3 H14 L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconIllustration({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20 Q12 4 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 16 Q12 10 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconMusicAudio({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 10 V18 M8 8 V16 M12 12 V20 M16 6 V14 M20 9 V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconFilmMotion({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9 L16 12 L10 15 Z" fill="currentColor" />
    </svg>
  );
}

export function IconFashion({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 4 H16 L18 8 H6 Z M6 8 H18 V20 H6 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconWriting({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 6 H20 M4 12 H16 M4 18 H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 14 L21 17 L18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArchitecture({ size = 28, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3 L21 10 V21 H3 V10 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 21 V14 H15 V21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const ICON_MAP: Record<Vertical, ComponentType<IconProps>> = {
  ux_ui: IconUxUi,
  graphic_design: IconGraphicDesign,
  photography: IconPhotography,
  illustration: IconIllustration,
  music_audio: IconMusicAudio,
  film_motion: IconFilmMotion,
  fashion: IconFashion,
  writing: IconWriting,
  architecture: IconArchitecture,
};

export function VerticalIcon({ vertical, size = 28, className = "" }: { vertical: Vertical; size?: number; className?: string }) {
  const Icon = ICON_MAP[vertical];
  return <Icon size={size} className={className} />;
}

import React from 'react';

export type LogoVariant =
  | 'neural-spark'
  | 'infinity-ribbon'
  | 'prism-brain'
  | 'royal-crown'
  | 'monogram-pulse'
  | 'kaleidoscope';

export interface LogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showText?: boolean;
  tagline?: boolean;
  dark?: boolean;
}

export const LOGO_CONCEPTS: {
  id: LogoVariant;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  accentColors: string[];
}[] = [
  {
    id: 'neural-spark',
    title: 'Neural Spark Starburst',
    subtitle: 'Primary Concept (AI + Celebration)',
    description:
      'An 8-point festive explosion merged with interconnected neural nodes and golden sparks. Balances high-tech AI copilot intelligence with joyful event starbursts.',
    category: 'Modern Tech & Festival',
    accentColors: ['#231530', '#E06D28', '#F59E0B'],
  },
  {
    id: 'infinity-ribbon',
    title: 'Festive Ribbon Loop',
    subtitle: 'Endless Celebration Flow',
    description:
      'A continuous, fluid ribbon loop weaving an infinity motif with a glowing AI starburst center. Symbolizes frictionless, endless event planning and harmony.',
    category: 'Fluid & Luxury',
    accentColors: ['#9333EA', '#F97316', '#FBBF24'],
  },
  {
    id: 'prism-brain',
    title: 'Confetti Prism Brain',
    subtitle: 'Multi-Faceted Event Mind',
    description:
      'A faceted crystalline geometric polygon brain filled with floating celebration confetti. Highlights intelligent multi-vendor budgeting and structured creativity.',
    category: 'Geometric & Playful',
    accentColors: ['#0D9488', '#E06D28', '#EC4899', '#4F46E5'],
  },
  {
    id: 'royal-crown',
    title: 'Royal Crown & Sparkle',
    subtitle: 'Grand Weddings & Galas',
    description:
      'A geometric crown intertwined with a central diamond AI sparkle. Perfect for grand Indian weddings, milestone galas, and VIP hospitality management.',
    category: 'Ultra Luxury & Elegance',
    accentColors: ['#D97706', '#1E1B4B', '#FFFBEB'],
  },
  {
    id: 'monogram-pulse',
    title: 'Dynamic FM Monogram',
    subtitle: 'Minimalist Brand Mark',
    description:
      'A sleek typographic mark where the letter F and M merge into a fluid soundwave pulse with a radiant spark. Clean, memorable, and corporate-ready.',
    category: 'Corporate & Minimal',
    accentColors: ['#E06D28', '#231530', '#38BDF8'],
  },
  {
    id: 'kaleidoscope',
    title: 'Celebration Kaleidoscope',
    subtitle: 'Firework Mandala Blossom',
    description:
      'A radial blossom inspired by fireworks, rangoli, and Indian festival mandalas, with an AI core. Represents unity, guest harmony, and vibrant memories.',
    category: 'Cultural & Festive',
    accentColors: ['#7C3AED', '#E11D48', '#F59E0B'],
  },
];

export const LogoMark: React.FC<{
  variant?: LogoVariant;
  dimension?: number;
  className?: string;
}> = ({ variant = 'neural-spark', dimension = 36, className = '' }) => {
  switch (variant) {
    case 'infinity-ribbon':
      return (
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="inf-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="50%" stopColor="#E06D28" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="inf-grad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#C026D3" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#FAF5FF" opacity="0.6" />
          <path
            d="M32 50C32 40 40 32 50 50C60 68 68 60 68 50C68 40 60 32 50 50C40 68 32 60 32 50Z"
            stroke="url(#inf-grad1)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 50L50.01 50.01"
            stroke="url(#inf-grad2)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Sparkles */}
          <path d="M50 25L52 32L59 34L52 36L50 43L48 36L41 34L48 32Z" fill="#F59E0B" />
          <path d="M72 32L73.5 37L78.5 38.5L73.5 40L72 45L70.5 40L65.5 38.5L70.5 37Z" fill="#E06D28" />
          <circle cx="28" cy="65" r="3" fill="#9333EA" />
          <circle cx="72" cy="65" r="3" fill="#FBBF24" />
        </svg>
      );

    case 'prism-brain':
      return (
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="prism-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="28" fill="url(#prism-bg)" />
          {/* Faceted brain polygon */}
          <path d="M50 18L32 30L25 50L35 72L50 82L65 72L75 50L68 30Z" fill="#1E293B" opacity="0.5" />
          {/* Jewel Polygons */}
          <polygon points="50,18 32,30 50,42" fill="#E06D28" opacity="0.9" />
          <polygon points="50,18 68,30 50,42" fill="#F59E0B" opacity="0.95" />
          <polygon points="32,30 25,50 38,50 50,42" fill="#0D9488" opacity="0.9" />
          <polygon points="68,30 75,50 62,50 50,42" fill="#EC4899" opacity="0.9" />
          <polygon points="25,50 35,72 50,62 38,50" fill="#6366F1" opacity="0.95" />
          <polygon points="75,50 65,72 50,62 62,50" fill="#8B5CF6" opacity="0.95" />
          <polygon points="35,72 50,82 50,62" fill="#14B8A6" opacity="0.85" />
          <polygon points="65,72 50,82 50,62" fill="#F43F5E" opacity="0.85" />
          <polygon points="50,42 38,50 50,62 62,50" fill="#FFFFFF" opacity="0.95" />
          {/* Floating confetti dots */}
          <circle cx="20" cy="24" r="3" fill="#FBBF24" />
          <circle cx="80" cy="24" r="2.5" fill="#38BDF8" />
          <rect x="78" y="72" width="5" height="5" transform="rotate(25 78 72)" fill="#F43F5E" />
          <rect x="18" y="70" width="5" height="5" transform="rotate(45 18 70)" fill="#10B981" />
        </svg>
      );

    case 'royal-crown':
      return (
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="crown-bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#231530" />
              <stop offset="100%" stopColor="#0F0814" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="28" fill="url(#crown-bg)" />
          {/* Crown Base */}
          <path
            d="M20 68L26 36L40 50L50 26L60 50L74 36L80 68H20Z"
            fill="url(#crown-gold)"
            stroke="#FFFBEB"
            strokeWidth="2"
          />
          <path d="M20 68C20 73 80 73 80 68H20Z" fill="#B45309" />
          <rect x="24" y="62" width="52" height="6" rx="3" fill="#FEF3C7" opacity="0.8" />
          {/* Jewels on Crown Peaks */}
          <circle cx="26" cy="36" r="4" fill="#EF4444" />
          <circle cx="74" cy="36" r="4" fill="#3B82F6" />
          {/* Center AI Diamond Sparkle */}
          <path
            d="M50 14L53.5 22.5L62 26L53.5 29.5L50 38L46.5 29.5L38 26L46.5 22.5Z"
            fill="#FFFFFF"
          />
          <circle cx="50" cy="54" r="5" fill="#10B981" />
        </svg>
      );

    case 'monogram-pulse':
      return (
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="mono-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E06D28" />
              <stop offset="50%" stopColor="#C4551D" />
              <stop offset="100%" stopColor="#231530" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="26" fill="#231530" />
          {/* Interlocking F and M */}
          <path
            d="M24 26H50C54.4 26 58 29.6 58 34C58 38.4 54.4 42 50 42H38V54H48C52.4 54 56 57.6 56 62C56 66.4 52.4 70 48 70H24V26Z"
            fill="url(#mono-grad)"
          />
          <path
            d="M48 74V44L60 62L72 44V74"
            stroke="#F59E0B"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M78 28L80 33L85 35L80 37L78 42L76 37L71 35L76 33Z" fill="#38BDF8" />
        </svg>
      );

    case 'kaleidoscope':
      return (
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="kal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#FDF2F8" />
          {/* Mandala Petals */}
          <g stroke="url(#kal-grad)" strokeWidth="3" fill="none">
            <ellipse cx="50" cy="28" rx="8" ry="16" />
            <ellipse cx="50" cy="72" rx="8" ry="16" />
            <ellipse cx="28" cy="50" rx="16" ry="8" />
            <ellipse cx="72" cy="50" rx="16" ry="8" />
            <ellipse
              cx="50"
              cy="50"
              rx="9"
              ry="20"
              transform="rotate(45 50 50)"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="9"
              ry="20"
              transform="rotate(-45 50 50)"
            />
          </g>
          <circle cx="50" cy="50" r="12" fill="#7C3AED" />
          <path d="M50 42L52.5 47.5L58 50L52.5 52.5L50 58L47.5 52.5L42 50L47.5 47.5Z" fill="#FFFBEB" />
        </svg>
      );

    case 'neural-spark':
    default:
      return (
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <defs>
            <linearGradient id="ns-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#231530" />
              <stop offset="50%" stopColor="#3A1C4D" />
              <stop offset="100%" stopColor="#190C24" />
            </linearGradient>
            <linearGradient id="ns-spark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8F4D" />
              <stop offset="50%" stopColor="#E06D28" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Rounded Squircle Container */}
          <rect width="100" height="100" rx="26" fill="url(#ns-bg)" />

          {/* Neural Connection Ring */}
          <circle
            cx="50"
            cy="50"
            r="32"
            stroke="#E06D28"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Connected Neural Nodes */}
          <line x1="50" y1="18" x2="50" y2="82" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />
          <line x1="18" y1="50" x2="82" y2="50" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />
          <line x1="27" y1="27" x2="73" y2="73" stroke="#E06D28" strokeWidth="1.5" opacity="0.6" />
          <line x1="73" y1="27" x2="27" y2="73" stroke="#E06D28" strokeWidth="1.5" opacity="0.6" />

          {/* Outer Festive Starburst Points */}
          <path
            d="M50 12L54.5 36.5L79 21L63.5 45.5L88 50L63.5 54.5L79 79L54.5 63.5L50 88L45.5 63.5L21 79L36.5 54.5L12 50L36.5 45.5L21 21L45.5 36.5Z"
            fill="url(#ns-spark)"
          />

          {/* Central AI Mind Diamond */}
          <path
            d="M50 32L55 45L68 50L55 55L50 68L45 55L32 50L45 45Z"
            fill="#FFFFFF"
          />

          {/* Sparkling Nodes */}
          <circle cx="50" cy="18" r="3.5" fill="#FBBF24" />
          <circle cx="82" cy="50" r="3.5" fill="#FBBF24" />
          <circle cx="50" cy="82" r="3.5" fill="#FBBF24" />
          <circle cx="18" cy="50" r="3.5" fill="#FBBF24" />
          <circle cx="73" cy="27" r="2.5" fill="#FFFFFF" />
          <circle cx="27" cy="73" r="2.5" fill="#FFFFFF" />
        </svg>
      );
  }
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'neural-spark',
  size = 'md',
  className = '',
  showText = true,
  tagline = false,
  dark = false,
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 28;
      case 'lg':
        return 44;
      case 'xl':
        return 56;
      case '2xl':
        return 72;
      case 'md':
      default:
        return 36;
    }
  };

  const dim = getDimension();

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark variant={variant} dimension={dim} />
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-display font-bold tracking-tight leading-none ${
              size === 'sm'
                ? 'text-lg'
                : size === 'lg'
                ? 'text-2xl'
                : size === 'xl'
                ? 'text-3xl'
                : size === '2xl'
                ? 'text-4xl'
                : 'text-xl'
            } ${dark ? 'text-white' : 'text-[#231530]'}`}
          >
            Festa<span className="text-[#E06D28]">Mind</span>
          </span>
          {tagline && (
            <span
              className={`text-[11px] font-medium leading-tight mt-0.5 ${
                dark ? 'text-amber-200/80' : 'text-[#231530]/60'
              }`}
            >
              You celebrate. We plan.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

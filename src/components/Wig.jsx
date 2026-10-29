import { forwardRef, useId } from 'react';

// Illustrated wig drawn in SVG so colour can change live (hair-to-hair recolour)
// and the same art works as a catalogue tile, a before/after image or a camera overlay.
const MAIN = {
  long: <path d="M50 112 C38 36 162 36 150 112 C160 172 154 222 140 244 L60 244 C46 222 40 172 50 112 Z" />,
  bob: <path d="M50 112 C40 38 160 38 150 112 C154 140 152 164 144 178 C124 186 76 186 56 178 C48 164 46 140 50 112 Z" />,
  curly: (
    <>
      <path d="M52 112 C40 36 160 36 148 112 C158 170 152 218 138 240 L62 240 C48 218 42 170 52 112 Z" />
      {[124, 150, 176, 202, 228].flatMap((y) => [
        <circle key={`l${y}`} cx={y === 124 ? 48 : 44} cy={y} r="14" />,
        <circle key={`r${y}`} cx={y === 124 ? 152 : 156} cy={y} r="14" />,
      ])}
      <circle cx="68" cy="240" r="13" />
      <circle cx="132" cy="240" r="13" />
    </>
  ),
  short: <path d="M56 108 C52 44 148 44 144 108 C142 124 138 132 134 136 L66 136 C62 132 58 124 56 108 Z" />,
};

const FRONT = {
  fringe: <path d="M58 108 C52 52 148 50 142 108 C132 84 112 70 96 72 C84 80 68 92 58 108 Z" />,
  short: <path d="M56 100 C52 40 148 40 144 100 C138 78 120 64 100 62 C78 64 62 78 56 100 Z" />,
};

/**
 * variant: 'stand'   – mannequin head with the wig on (cards, results, posts)
 *          'bare'    – mannequin head without a wig ("before" image)
 *          'overlay' – hair only, with a face-sized hole, for the camera try-on
 */
const Wig = forwardRef(function Wig(
  { kind = 'long', color = '#B4522E', variant = 'stand', height, label, className, style },
  ref,
) {
  const maskId = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const front = kind === 'short' ? FRONT.short : FRONT.fringe;
  const size = height ? { width: Math.round((height * 200) / 260), height } : {};

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 260"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      style={style}
      {...size}
    >
      {variant !== 'overlay' && (
        <g>
          <path d="M86 150 L86 206 C86 212 114 212 114 206 L114 150 Z" fill="#E6D6C6" />
          <rect x="96" y="208" width="8" height="34" rx="2" fill="#A89C92" />
          <path
            d="M100 242 L70 258 M100 242 L130 258 M100 242 L100 258"
            stroke="#A89C92"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}

      {variant === 'overlay' ? (
        <>
          <defs>
            <mask id={maskId}>
              <rect width="200" height="260" fill="#fff" />
              <ellipse cx="100" cy="134" rx="40" ry="52" fill="#000" />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`} fill={color}>
            {MAIN[kind]}
          </g>
          <g fill={color}>{front}</g>
        </>
      ) : variant === 'bare' ? (
        <>
          <ellipse cx="100" cy="112" rx="40" ry="52" fill="#E9DACB" />
          <path d="M64 96 C66 62 134 62 136 96 C124 80 76 80 64 96 Z" fill="#CBB8A6" />
        </>
      ) : (
        <>
          <g fill={color}>{MAIN[kind]}</g>
          <ellipse cx="100" cy="112" rx="40" ry="52" fill="#E9DACB" />
          <g fill={color}>{front}</g>
        </>
      )}

      {variant !== 'bare' && (
        <path
          d="M72 66 C92 54 122 56 136 74"
          stroke="#FFFFFF"
          strokeOpacity="0.28"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
});

export default Wig;

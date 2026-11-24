/** Small vector companion; motion is disabled by the site's reduced-motion rule. */
export default function AboutMascot() {
  return (
    <div className="about-mascot">
      <svg
        viewBox="0 0 128 136"
        role="img"
        aria-label="Maskot robot kecil melambaikan tangan"
        focusable="false"
      >
        <ellipse
          className="mascot-shadow"
          cx="65"
          cy="120"
          rx="27"
          ry="4"
          fill="#c6dfe1"
        />
        <g className="mascot-body">
          <path
            d="M64 35V23"
            stroke="#327e94"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="64" cy="19" r="5" fill="#f5a98b" />
          <rect x="30" y="52" width="9" height="20" rx="4.5" fill="#9ecdd5" />
          <rect x="91" y="52" width="9" height="20" rx="4.5" fill="#9ecdd5" />
          <path
            d="M37 71C26 72 24 82 28 86"
            fill="none"
            stroke="#327e94"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <g className="mascot-wave">
            <path
              d="M95 69C108 65 109 52 106 43"
              fill="none"
              stroke="#327e94"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M106 45L100 39M105 41V33M109 42L113 35"
              fill="none"
              stroke="#317082"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          <rect x="36" y="34" width="58" height="54" rx="17" fill="#327e94" />
          <rect x="42" y="42" width="46" height="29" rx="10" fill="#133f4f" />
          <g className="mascot-eyes" fill="#effafe">
            <rect x="51" y="51" width="6" height="9" rx="3" />
            <rect x="73" y="51" width="6" height="9" rx="3" />
          </g>
          <path
            d="M61 62Q65 66 69 62"
            fill="none"
            stroke="#b3e7f1"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="49" y="85" width="32" height="15" rx="6" fill="#83bcce" />
          <rect x="57" y="78" width="16" height="4" rx="2" fill="#c6edf2" />
          <rect x="44" y="99" width="16" height="8" rx="4" fill="#244e5b" />
          <rect x="70" y="99" width="16" height="8" rx="4" fill="#244e5b" />
          <path
            d="M46 39H53"
            stroke="#8dc9d7"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <g
          className="mascot-sparkle"
          fill="none"
          stroke="#d38770"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M19 34V42M15 38H23" />
          <path d="M108 16V24M104 20H112" />
        </g>
      </svg>
    </div>
  );
}

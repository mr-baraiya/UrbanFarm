import React from 'react';

/**
 * Premium Themed Vector Achievement Badges for UrbanFarm
 * Each badge features a unique geometric crest, gradient illumination, and symbolic artwork.
 */

export const BadgeEmblem = ({ id, isUnlocked = false, size = 76 }) => {
  const renderBadgeSVG = () => {
    switch (id) {
      case 'first_sprout':
        return (
          <g>
            <defs>
              <linearGradient id="sproutShield" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
              <linearGradient id="sproutGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="soilMound" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>

            {/* Hexagonal Shield Plate */}
            <polygon
              points="50,5 90,25 90,75 50,95 10,75 10,25"
              fill="url(#sproutShield)"
              stroke="url(#sproutGoldRim)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Inner Sheen Border */}
            <polygon
              points="50,11 84,28 84,71 50,89 16,71 16,28"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />

            {/* Earth / Soil Base */}
            <ellipse cx="50" cy="74" rx="24" ry="8" fill="url(#soilMound)" stroke="#78350f" strokeWidth="1" />
            <circle cx="34" cy="73" r="1.5" fill="#fde047" opacity="0.6" />
            <circle cx="66" cy="74" r="1.8" fill="#fde047" opacity="0.6" />

            {/* Sprout Stem */}
            <path
              d="M50,74 Q50,52 48,38"
              fill="none"
              stroke="#bbf7d0"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Left Leaf */}
            <path
              d="M48,48 C32,44 26,30 36,22 C46,22 51,36 48,48 Z"
              fill="url(#leafGrad)"
              stroke="#14532d"
              strokeWidth="1.5"
            />
            {/* Left leaf vein */}
            <path d="M37,28 Q44,38 48,47" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.7" />

            {/* Right Leaf */}
            <path
              d="M49,40 C65,34 72,20 62,14 C52,14 47,28 49,40 Z"
              fill="url(#leafGrad)"
              stroke="#14532d"
              strokeWidth="1.5"
            />
            {/* Right leaf vein */}
            <path d="M60,19 Q52,29 49,39" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.7" />

            {/* Morning Sunbeam / Sparkle */}
            <polygon points="50,14 52,19 57,20 52,21 50,26 48,21 43,20 48,19" fill="#ffffff" />
          </g>
        );

      case 'hydration_master':
        return (
          <g>
            <defs>
              <linearGradient id="hydroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="hydroRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>
              <linearGradient id="waterDrop" x1="20%" y1="10%" x2="80%" y2="90%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Circular Medallion */}
            <circle cx="50" cy="50" r="43" fill="url(#hydroGrad)" stroke="url(#hydroRim)" strokeWidth="4" />
            <circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* Ripple Waves */}
            <path d="M18,65 Q34,57 50,65 T82,65" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24,74 Q37,68 50,74 T76,74" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />

            {/* Glowing Water Droplet */}
            <path
              d="M50,18 C50,18 28,44 28,57 C28,69 38,77 50,77 C62,77 72,69 72,57 C72,44 50,18 50,18 Z"
              fill="url(#waterDrop)"
              stroke="#0369a1"
              strokeWidth="2"
            />
            {/* Droplet Specular Reflection */}
            <ellipse cx="43" cy="52" rx="4.5" ry="8" transform="rotate(-28 43 52)" fill="#ffffff" opacity="0.85" />
            <circle cx="59" cy="63" r="2.5" fill="#ffffff" opacity="0.7" />
          </g>
        );

      case 'plant_doctor':
      case 'disease_detective':
        return (
          <g>
            <defs>
              <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="40%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
              <linearGradient id="docRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3e8ff" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#6b21a8" />
              </linearGradient>
              <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3e8ff" />
              </linearGradient>
            </defs>

            {/* Octagonal Shield */}
            <polygon
              points="30,7 70,7 93,30 93,70 70,93 30,93 7,70 7,30"
              fill="url(#docGrad)"
              stroke="url(#docRim)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <polygon
              points="32,13 68,13 87,32 87,68 68,87 32,87 13,68 13,32"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />

            {/* Medical Cross Base */}
            <path
              d="M40,24 H60 V40 H76 V60 H60 V76 H40 V60 H24 V40 H40 Z"
              fill="url(#crossGrad)"
              stroke="#581c87"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Center Botanical Caduceus Leaf */}
            <path
              d="M50,30 C40,40 39,56 50,66 C61,56 60,40 50,30 Z"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="1"
            />
            <path d="M50,34 L50,63" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path d="M50,44 Q44,40 42,38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M50,52 Q56,48 58,46" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

            {/* Golden Healing Sparkle */}
            <polygon points="76,18 78,24 84,26 78,28 76,34 74,28 68,26 74,24" fill="#fde047" />
          </g>
        );

      case 'first_harvest':
      case 'master_harvester':
        return (
          <g>
            <defs>
              <linearGradient id="harvestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="40%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#9a3412" />
              </linearGradient>
              <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="basketGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>

            {/* Festive Ribbon Tails */}
            <path d="M34,75 L22,94 L37,87 L50,95 L47,76" fill="#c2410c" stroke="#7c2d12" strokeWidth="1" />
            <path d="M66,75 L78,94 L63,87 L50,95 L53,76" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />

            {/* Circular Medallion */}
            <circle cx="50" cy="46" r="39" fill="url(#harvestGrad)" stroke="url(#goldRim)" strokeWidth="4" />
            <circle cx="50" cy="46" r="33" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

            {/* Vegetables / Produce in Basket */}
            {/* Red Tomato */}
            <circle cx="42" cy="37" r="10" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
            <path d="M42,27 L40,30 M42,27 L44,30 M42,27 L42,24" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="39" cy="34" r="2.5" fill="#ffffff" opacity="0.65" />

            {/* Golden Fruit */}
            <circle cx="58" cy="38" r="9" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <ellipse cx="50" cy="33" rx="6" ry="8" fill="#84cc16" stroke="#4d7c0f" strokeWidth="1" />

            {/* Woven Harvest Basket */}
            <path
              d="M24,44 C24,44 26,69 50,69 C74,69 76,44 76,44 Z"
              fill="url(#basketGrad)"
              stroke="#78350f"
              strokeWidth="2.5"
            />
            {/* Basket Rim */}
            <path d="M22,44 L78,44" stroke="#fde047" strokeWidth="3.5" strokeLinecap="round" />
            {/* Basket Weave lines */}
            <path d="M35,45 L39,67 M50,45 L50,69 M65,45 L61,67" stroke="#78350f" strokeWidth="2" opacity="0.65" />
          </g>
        );

      case 'green_thumb':
      case 'green_thumb_pioneer':
        return (
          <g>
            <defs>
              <linearGradient id="thumbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="40%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id="goldLaurel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
              <linearGradient id="emeraldThumb" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dcfce7" />
                <stop offset="40%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>

            {/* Diamond Crest */}
            <polygon
              points="50,5 92,45 50,95 8,45"
              fill="url(#thumbGrad)"
              stroke="url(#goldLaurel)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <polygon
              points="50,13 84,45 50,85 16,45"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />

            {/* Laurel Wreath */}
            <path d="M25,58 C18,43 25,28 35,22" fill="none" stroke="url(#goldLaurel)" strokeWidth="3" strokeLinecap="round" />
            <path d="M75,58 C82,43 75,28 65,22" fill="none" stroke="url(#goldLaurel)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="23" cy="45" r="3.5" fill="#fef08a" />
            <circle cx="30" cy="32" r="3.5" fill="#fef08a" />
            <circle cx="77" cy="45" r="3.5" fill="#fef08a" />
            <circle cx="70" cy="32" r="3.5" fill="#fef08a" />

            {/* Green Thumb */}
            <path
              d="M44,65 L58,65 C62,65 64,63 64,59 L64,47 C64,44 62,42 58,42 L52,42 L54,28 C54,24 51,22 47,23 C44,24 43,28 43,32 L43,44 L38,49 L38,60 C38,63 41,65 44,65 Z"
              fill="url(#emeraldThumb)"
              stroke="#064e3b"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M47,38 Q50,42 50,48" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <polygon points="56,20 58,25 63,26 58,27 56,32 54,27 49,26 54,25" fill="#ffffff" />
          </g>
        );

      case 'community_gardener':
      case 'community_mentor':
        return (
          <g>
            <defs>
              <linearGradient id="commGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="40%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="commRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#3730a3" />
              </linearGradient>
            </defs>

            {/* Circular Crest */}
            <circle cx="50" cy="50" r="43" fill="url(#commGrad)" stroke="url(#commRim)" strokeWidth="4" />
            <circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

            {/* Community Figures */}
            <circle cx="33" cy="40" r="6.5" fill="#c7d2fe" />
            <path d="M22,64 C22,54 28,50 35,50 C38,50 41,51 43,53 C39,57 37,61 37,66 L22,66 Z" fill="#818cf8" />

            <circle cx="67" cy="40" r="6.5" fill="#c7d2fe" />
            <path d="M78,64 C78,54 72,50 65,50 C62,50 59,51 57,53 C61,57 63,61 63,66 L78,66 Z" fill="#818cf8" />

            {/* Central Leader / Figure */}
            <circle cx="50" cy="33" r="8" fill="#ffffff" />
            <path d="M35,67 C35,54 42,49 50,49 C58,49 65,54 65,67 Z" fill="#ffffff" />

            {/* Green Collaborative Sprout */}
            <path d="M50,54 L50,38" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
            <path d="M50,42 C44,39 40,32 45,28 C50,29 50,37 50,42 Z" fill="#4ade80" />
            <path d="M50,40 C56,37 60,30 55,26 C50,27 50,35 50,40 Z" fill="#4ade80" />

            {/* Crown Star */}
            <polygon points="50,11 52,16 57,17 52,18 50,23 48,18 43,17 48,16" fill="#fde047" />
          </g>
        );

      case 'gardening_guru':
      case 'soil_alchemist':
        return (
          <g>
            <defs>
              <linearGradient id="guruGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="guruSunburst" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>

            {/* 12-Point Radiant Starburst */}
            <polygon
              points="50,3 62,13 78,9 82,25 97,33 91,49 97,65 82,73 78,89 62,85 50,95 38,85 22,89 18,73 3,65 9,49 3,33 18,25 22,9 38,13"
              fill="url(#guruGold)"
            />
            {/* Center Disc */}
            <circle cx="50" cy="49" r="33" fill="url(#guruSunburst)" stroke="#fef08a" strokeWidth="3" />
            <circle cx="50" cy="49" r="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Imperial Crown */}
            <path
              d="M30,56 L34,34 L42,45 L50,28 L58,45 L66,34 L70,56 Z"
              fill="url(#crownGrad)"
              stroke="#78350f"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M28,56 L72,56 L70,63 L30,63 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="34" cy="34" r="2.5" fill="#ef4444" />
            <circle cx="50" cy="28" r="3" fill="#38bdf8" />
            <circle cx="66" cy="34" r="2.5" fill="#22c55e" />
            <circle cx="42" cy="59.5" r="1.8" fill="#ffffff" />
            <circle cx="50" cy="59.5" r="1.8" fill="#ffffff" />
            <circle cx="58" cy="59.5" r="1.8" fill="#ffffff" />

            {/* Sprout Seal */}
            <path d="M50,73 L50,64" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="73" r="2" fill="#22c55e" />
          </g>
        );

      case 'weather_watcher':
        return (
          <g>
            <defs>
              <linearGradient id="weatherBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="weatherRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>

            {/* Crest Shield */}
            <path
              d="M50,7 C78,7 90,20 90,49 C90,74 68,90 50,96 C32,90 10,74 10,49 C10,20 22,7 50,7 Z"
              fill="url(#weatherBg)"
              stroke="url(#weatherRim)"
              strokeWidth="4"
            />
            <path
              d="M50,13 C74,13 84,23 84,49 C84,69 64,84 50,90 C36,84 16,69 16,49 C16,23 26,13 50,13 Z"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />

            {/* Radiant Sun */}
            <circle cx="39" cy="37" r="16" fill="url(#sunGrad)" stroke="#d97706" strokeWidth="1" />
            <path
              d="M39,14 L39,20 M39,54 L39,60 M16,37 L22,37 M56,37 L62,37 M23,21 L27,25 M51,49 L55,53 M23,53 L27,49 M51,25 L55,21"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Puffy Cloud */}
            <path
              d="M33,65 L69,65 C76,65 80,60 80,54 C80,48 75,44 70,44 C70,35 63,29 55,29 C48,29 42,33 40,39 C38,38 36,37 34,37 C27,37 23,42 23,49 C23,57 27,65 33,65 Z"
              fill="url(#cloudGrad)"
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Raindrops */}
            <path d="M42,71 L39,78" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <path d="M54,71 L51,78" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <path d="M66,71 L63,78" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`proper-badge-emblem ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="badge-svg-canvas"
        style={{
          filter: isUnlocked
            ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.18)) drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
            : 'saturate(0.7) brightness(0.92) contrast(0.98) drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {renderBadgeSVG()}
      </svg>
    </div>
  );
};

export default BadgeEmblem;

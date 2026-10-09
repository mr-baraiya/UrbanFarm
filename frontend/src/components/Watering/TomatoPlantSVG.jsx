import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  Thermometer,
  Sun,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Sprout,
  Activity,
  Scissors,
  Flame,
  Heart,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { TOMATO_THRESHOLDS } from '../../utils/plantStatus';
import './TomatoPlantSVG.css';

/**
 * 1. Single Botanical Tomato Leaflet (Elongated Lanceolate with Fine Serrations)
 * Real Solanum lycopersicum leaflets are elongated with serrated margins, NOT 3-lobed maple leaves.
 */
const SingleLeaflet = ({
  length = 32,
  width = 13,
  angle = 0,
  fill = 'url(#leafGradHealthy)',
  scale = 1,
  flip = false,
  curled = false,
  chlorosis = false,
}) => {
  const l = length;
  const w = width * (curled ? 0.6 : 1);

  // Elongated ovate/lanceolate silhouette with fine multi-toothed serrated edges
  const serratedPath = `M 0 0 
    C ${l * 0.12} ${-w * 0.45}, ${l * 0.22} ${-w * 0.8}, ${l * 0.32} ${-w * 0.65} 
    C ${l * 0.42} ${-w * 0.95}, ${l * 0.58} ${-w * 0.85}, ${l * 0.68} ${-w * 0.98} 
    C ${l * 0.78} ${-w * 0.7}, ${l * 0.88} ${-w * 0.5}, ${l} 0 
    C ${l * 0.88} ${w * 0.5}, ${l * 0.78} ${w * 0.7}, ${l * 0.68} ${w * 0.98} 
    C ${l * 0.58} ${w * 0.85}, ${l * 0.42} ${w * 0.95}, ${l * 0.32} ${w * 0.65} 
    C ${l * 0.22} ${w * 0.8}, ${l * 0.12} ${w * 0.45}, 0 0 Z`;

  const leafletFill = chlorosis ? 'url(#leafGradChlorosis)' : fill;

  return (
    <g transform={`rotate(${angle}) scale(${flip ? -scale : scale}, ${scale})`}>
      {/* Leaflet Blade Silhouette with Soft Drop Shadow */}
      <path
        d={serratedPath}
        fill={leafletFill}
        stroke="#0b2917"
        strokeWidth="0.75"
        strokeLinejoin="round"
        filter="url(#leafDropShadow)"
      />

      {/* Heat Stress Longitudinal Inward Leaf Curl Crease */}
      {curled && (
        <path
          d={`M ${l * 0.08} ${-w * 0.35} Q ${l * 0.5} ${-w * 0.85} ${l * 0.92} 0`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}

      {/* Primary Translucent Glowing Midrib */}
      <path
        d={`M 0 0 Q ${l * 0.5} ${-w * 0.03} ${l * 0.94} 0`}
        fill="none"
        stroke={chlorosis ? '#fef08a' : '#86efac'}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Fine Branching Lateral Veins */}
      <path
        d={`M ${l * 0.22} 0 Q ${l * 0.28} ${-w * 0.35} ${l * 0.34} ${-w * 0.6}
            M ${l * 0.48} 0 Q ${l * 0.54} ${-w * 0.32} ${l * 0.64} ${-w * 0.65}
            M ${l * 0.72} 0 Q ${l * 0.78} ${-w * 0.22} ${l * 0.84} ${-w * 0.35}
            M ${l * 0.22} 0 Q ${l * 0.28} ${w * 0.35} ${l * 0.34} ${w * 0.6}
            M ${l * 0.48} 0 Q ${l * 0.54} ${w * 0.32} ${l * 0.64} ${w * 0.65}
            M ${l * 0.72} 0 Q ${l * 0.78} ${w * 0.22} ${l * 0.84} ${w * 0.35}`}
        fill="none"
        stroke={chlorosis ? '#fde047' : '#bbf7d0'}
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Sunlit Specular Glare on Upper Curve */}
      <path
        d={`M ${l * 0.15} ${-w * 0.2} Q ${l * 0.45} ${-w * 0.45} ${l * 0.75} ${-w * 0.2}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.32)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  );
};

/**
 * 2. Botanical Pinnately Compound Tomato Leaf Spray (Odd-Pinnate with 5–9 Leaflets)
 * Genuine tomato compound leaf with central rachis, petiolules, and intercalary leaflets.
 */
const PinnateCompoundLeaf = ({
  originX = 230,
  originY = 200,
  length = 88,
  angle = 25,
  droopAngle = 0,
  flip = false,
  swayDuration = 5,
  swayDelay = 0,
  leafColorGrad = 'url(#leafGradHealthy)',
  curveOffset = 10,
  scale = 1,
  curled = false,
  chlorosis = false,
}) => {
  const baseAngle = flip ? -angle : angle;
  const currentDroop = flip ? -droopAngle : droopAngle;
  const totalAngle = baseAngle + currentDroop;

  return (
    <g transform={`translate(${originX}, ${originY})`}>
      <motion.g
        animate={{
          rotate: [totalAngle - 1.4, totalAngle + 1.5, totalAngle - 1.4],
        }}
        transition={{
          duration: swayDuration,
          delay: swayDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <g transform={`scale(${flip ? -scale : scale}, ${scale})`}>
          {/* Main Curved Rachis / Petiole Stem */}
          <path
            d={`M 0 0 Q ${length * 0.45} ${curveOffset * 0.35} ${length} ${curveOffset}`}
            fill="none"
            stroke="#1b4332"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          {/* Petiole Specular / Trichome Highlight */}
          <path
            d={`M 0 0 Q ${length * 0.45} ${curveOffset * 0.35} ${length} ${curveOffset}`}
            fill="none"
            stroke="#4ade80"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* 1. Basal Major Leaflet Pair on Little Sub-stems (Petiolules) */}
          <g transform={`translate(${length * 0.24}, ${curveOffset * 0.16})`}>
            <line x1="0" y1="0" x2="-3" y2="-9" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="0" x2="-3" y2="9" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
            <g transform="translate(-3, -9)">
              <SingleLeaflet length={28} width={12} angle={-55} fill={leafColorGrad} scale={0.78} curled={curled} chlorosis={chlorosis} />
            </g>
            <g transform="translate(-3, 9)">
              <SingleLeaflet length={28} width={12} angle={55} fill={leafColorGrad} scale={0.78} curled={curled} chlorosis={chlorosis} />
            </g>
          </g>

          {/* 2. Tiny Intercalary Leaflets 1 (Botanical Signature of Tomato Foliage) */}
          <g transform={`translate(${length * 0.42}, ${curveOffset * 0.32})`}>
            <g transform="translate(0, -4.5)">
              <SingleLeaflet length={15} width={7} angle={-72} fill={leafColorGrad} scale={0.5} curled={curled} chlorosis={chlorosis} />
            </g>
            <g transform="translate(0, 4.5)">
              <SingleLeaflet length={15} width={7} angle={72} fill={leafColorGrad} scale={0.5} curled={curled} chlorosis={chlorosis} />
            </g>
          </g>

          {/* 3. Mid Major Leaflet Pair on Petiolules */}
          <g transform={`translate(${length * 0.62}, ${curveOffset * 0.54})`}>
            <line x1="0" y1="0" x2="-4" y2="-10" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="0" x2="-4" y2="10" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
            <g transform="translate(-4, -10)">
              <SingleLeaflet length={34} width={14.5} angle={-42} fill={leafColorGrad} scale={0.92} curled={curled} chlorosis={chlorosis} />
            </g>
            <g transform="translate(-4, 10)">
              <SingleLeaflet length={34} width={14.5} angle={42} fill={leafColorGrad} scale={0.92} curled={curled} chlorosis={chlorosis} />
            </g>
          </g>

          {/* 4. Tiny Intercalary Leaflets 2 */}
          <g transform={`translate(${length * 0.78}, ${curveOffset * 0.72})`}>
            <g transform="translate(0, -4)">
              <SingleLeaflet length={14} width={6.5} angle={-68} fill={leafColorGrad} scale={0.45} curled={curled} chlorosis={chlorosis} />
            </g>
            <g transform="translate(0, 4)">
              <SingleLeaflet length={14} width={6.5} angle={68} fill={leafColorGrad} scale={0.45} curled={curled} chlorosis={chlorosis} />
            </g>
          </g>

          {/* 5. Terminal Leaflet (Largest at the apex of the compound spray) */}
          <g transform={`translate(${length}, ${curveOffset})`}>
            <SingleLeaflet length={42} width={17} angle={3} fill={leafColorGrad} scale={1.08} curled={curled} chlorosis={chlorosis} />
          </g>
        </g>
      </motion.g>
    </g>
  );
};

/**
 * 3. 3D Spherical Tomato with 6-Star Calyx and Clear Suspended Truss Hanging
 */
const GlossyTomato = ({
  cx = 0,
  cy = 0,
  r = 24,
  stage = 'ripe', // 'ripe' | 'turning' | 'breaker' | 'green'
  hangAngle = 0,
  swayDelay = 0,
  glowBoost = false,
}) => {
  let gradId = 'url(#tomatoRipeGrad)';
  let shadowStroke = '#450a0a';

  if (stage === 'turning') {
    gradId = 'url(#tomatoTurningGrad)';
    shadowStroke = '#7c2d12';
  } else if (stage === 'breaker') {
    gradId = 'url(#tomatoBreakerGrad)';
    shadowStroke = '#854d0e';
  } else if (stage === 'green') {
    gradId = 'url(#tomatoGreenGrad)';
    shadowStroke = '#14532d';
  }

  return (
    <motion.g
      animate={{
        rotate: [hangAngle - 1.2, hangAngle + 1.2, hangAngle - 1.2],
        y: [-0.6, 0.8, -0.6],
      }}
      transition={{
        duration: 5.2,
        delay: swayDelay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Knobby Jointed Pedicel Stem (Connecting fruit clearly to truss raceme) */}
      <path
        d={`M ${cx} ${cy - r - 10} Q ${cx - 4} ${cy - r - 5} ${cx} ${cy - r}`}
        fill="none"
        stroke="#2d6a4f"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Swollen Joint Abscission Ring */}
      <circle cx={cx - 2} cy={cy - r - 5.5} r="2.2" fill="#1b4332" />

      {/* 3D Tomato Sphere Body with Radial Glow & Drop Shadow */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={gradId}
        filter="url(#fruitSubtleGlow)"
        stroke={shadowStroke}
        strokeWidth="1"
      />

      {/* Darker Underside Shadow Arc for 3D Roundness */}
      <path
        d={`M ${cx - r * 0.88} ${cy + r * 0.28} Q ${cx} ${cy + r * 1.05} ${cx + r * 0.88} ${cy + r * 0.28} Q ${cx} ${cy + r * 0.65} ${cx - r * 0.88} ${cy + r * 0.28} Z`}
        fill="rgba(0, 0, 0, 0.32)"
      />

      {/* Primary Specular Highlight Arc (Top-Left Glare) */}
      <ellipse
        cx={cx - r * 0.34}
        cy={cy - r * 0.36}
        rx={r * 0.38}
        ry={r * 0.2}
        transform={`rotate(-32, ${cx - r * 0.34}, ${cy - r * 0.36})`}
        fill="#ffffff"
        opacity={stage === 'ripe' ? (glowBoost ? 0.95 : 0.85) : 0.68}
      />

      {/* Secondary Crisp Pin-Point Highlight */}
      <circle
        cx={cx - r * 0.16}
        cy={cy - r * 0.52}
        r={Math.max(1.5, r * 0.09)}
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Bottom Ambient Ground/Foliage Bounce Light Reflection */}
      <ellipse
        cx={cx + r * 0.34}
        cy={cy + r * 0.4}
        rx={r * 0.34}
        ry={r * 0.13}
        transform={`rotate(35, ${cx + r * 0.34}, ${cy + r * 0.4})`}
        fill={stage === 'ripe' ? 'rgba(254, 202, 202, 0.35)' : 'rgba(254, 240, 138, 0.35)'}
      />

      {/* Botanical 6-Point Star Calyx (Green Sepals curling over the fruit shoulders) */}
      <g transform={`translate(${cx}, ${cy - r + 1.5}) scale(${r / 16})`}>
        <path d="M 0 0 Q -5 -9 -11 -7 Q -6 -2 0 0" fill="#1b4332" stroke="#081c15" strokeWidth="0.5" />
        <path d="M 0 0 Q 5 -9 11 -7 Q 6 -2 0 0" fill="#2d6a4f" stroke="#081c15" strokeWidth="0.5" />
        <path d="M 0 0 Q -9 2 -13 9 Q -6 4 0 0" fill="#1b4332" stroke="#081c15" strokeWidth="0.5" />
        <path d="M 0 0 Q 9 2 13 9 Q 6 4 0 0" fill="#2d6a4f" stroke="#081c15" strokeWidth="0.5" />
        <path d="M 0 0 Q -2 8 -3 13 Q 1 6 0 0" fill="#40916c" stroke="#081c15" strokeWidth="0.5" />
        <path d="M 0 0 Q 2 8 3 13 Q -1 6 0 0" fill="#2d6a4f" stroke="#081c15" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="2.6" fill="#081c15" />
      </g>
    </motion.g>
  );
};

/**
 * 4. Authentic Botanical Tomato Flower (5 Swept-Back Reflexed Petals & Conical Anther Cone)
 */
const BotanicalTomatoFlower = ({ originX = 0, originY = 0, scale = 1, swayDelay = 0 }) => (
  <g transform={`translate(${originX}, ${originY}) scale(${scale})`}>
    <motion.g
      animate={{ rotate: [-2.5, 3.2, -2.5] }}
      transition={{ duration: 4.2, delay: swayDelay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* 1. Slender Green Calyx Sepals (Behind Petals) */}
      <g fill="#2d6a4f">
        {[0, 72, 144, 216, 288].map((rot, i) => (
          <path
            key={`sep-${i}`}
            d="M 0 0 L -2.2 -15 L 0 -12 L 2.2 -15 Z"
            transform={`rotate(${rot})`}
            stroke="#1b4332"
            strokeWidth="0.5"
          />
        ))}
      </g>

      {/* 2. Five Swept-Back (Reflexed) Pointed Yellow Petals */}
      <g fill="url(#flowerYellowGrad)">
        {[0, 72, 144, 216, 288].map((rot, i) => (
          <path
            key={`pet-${i}`}
            d="M 0 0 C -4.5 -4.5, -4.5 -10, 0 -14.5 C 4.5 -10, 4.5 -4.5, 0 0 Z"
            transform={`rotate(${rot + 36})`}
            stroke="#ca8a04"
            strokeWidth="0.5"
          />
        ))}
      </g>

      {/* 3. Conical Anther Cone / Staminal Column (Distinctive to Solanaceae Tomato Flowers) */}
      <path
        d="M -3 0 L -1.4 -7.5 L 0 -10.5 L 1.4 -7.5 L 3 0 Z"
        fill="url(#antherConeGrad)"
        stroke="#a16207"
        strokeWidth="0.5"
      />
      {/* Stigma tip */}
      <circle cx="0" cy="-10.8" r="1" fill="#4ade80" />
      <circle cx="0" cy="0" r="2.4" fill="#eab308" />
    </motion.g>
  </g>
);

/**
 * 5. Clear, Interactive Sucker Pruning Tip Badge
 */
const AxillarySucker = ({ originX = 236, originY = 222 }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <g transform={`translate(${originX}, ${originY})`} className="sucker-group">
      {/* 45-degree angle emergence between main stem and branch */}
      <g transform="rotate(38)">
        <path d="M 0 0 Q 7 -9 16 -16" fill="none" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" />
        <g transform="translate(16, -16)">
          <SingleLeaflet length={18} width={8} angle={-35} fill="url(#leafGradHealthy)" scale={0.58} />
          <SingleLeaflet length={18} width={8} angle={35} fill="url(#leafGradHealthy)" scale={0.58} />
          <SingleLeaflet length={20} width={9} angle={0} fill="url(#leafGradHealthy)" scale={0.65} />
        </g>
      </g>

      {/* Dotted Pruning Cut Line Cue */}
      <line
        x1="2"
        y1="-2"
        x2="10"
        y2="-10"
        stroke="#ef4444"
        strokeWidth="1.6"
        strokeDasharray="2.5 2"
      />

      {/* Interactive Pruning Hotspot Trigger */}
      <g
        className="sucker-prune-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setShowTip((prev) => !prev);
        }}
        style={{ cursor: 'pointer' }}
      >
        <circle cx="6" cy="-6" r="8" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.5" />
        <g transform="translate(2.2, -10.2) scale(0.68)">
          <path
            d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0l6 6M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 0l6-6"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* Popover Pruning Guide */}
      {showTip && (
        <foreignObject x="-85" y="-85" width="180" height="80" style={{ overflow: 'visible' }}>
          <div className="sucker-tooltip-card">
            <div className="tooltip-badge">
              <Scissors size={12} /> <span>Pruning Tip: Sucker Shoot</span>
            </div>
            <p className="tooltip-text">
              Pinch off 45° side shoots so the plant directs maximum energy to big, juicy tomatoes!
            </p>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

/**
 * 6. Simplified Sturdy Tomato Cage with Minimal Clean Ties
 */
const SturdyTomatoCage = () => (
  <g id="sturdy-support-cage">
    {/* 3 Heavy-Duty Vertical Stakes */}
    <path d="M 160 324 L 175 42" fill="none" stroke="url(#stakeDarkGrad)" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M 230 324 L 230 32" fill="none" stroke="url(#stakeLightGrad)" strokeWidth="6.5" strokeLinecap="round" />
    <path d="M 300 324 L 285 42" fill="none" stroke="url(#stakeDarkGrad)" strokeWidth="5.5" strokeLinecap="round" />

    {/* Horizontal Support Hoops / Trellis Rings */}
    <ellipse cx="230" cy="265" rx="76" ry="14" fill="none" stroke="#78350f" strokeWidth="2.8" opacity="0.85" />
    <ellipse cx="230" cy="175" rx="66" ry="12" fill="none" stroke="#78350f" strokeWidth="2.8" opacity="0.85" />
    <ellipse cx="230" cy="95" rx="56" ry="10" fill="none" stroke="#78350f" strokeWidth="2.8" opacity="0.85" />

    {/* Clean Soft Garden Ties at Node Points */}
    <path d="M 224 262 Q 230 266 236 262" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
    <path d="M 224 172 Q 230 176 236 172" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
    <path d="M 225 94 Q 230 97 235 94" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
  </g>
);

/**
 * 7. 20-Liter Planter with Mulch Chips, Perlite Specks & Deep Saucer
 */
const BigPlanterContainer20L = ({ soilMoisture = 45, watering = false }) => {
  const soilGradId =
    soilMoisture < 40
      ? 'url(#soilDryGrad)'
      : soilMoisture > 70
      ? 'url(#soilWetGrad)'
      : 'url(#soilOptimalGrad)';

  return (
    <g id="big-planter-20l">
      {/* Soft Ambient Ground Shadow */}
      <ellipse cx="230" cy="432" rx="140" ry="15" fill="rgba(15, 23, 42, 0.16)" />

      {/* Deep Drainage Tray / Saucer Base (Prevents Waterlogged Root Rot) */}
      <ellipse cx="230" cy="416" rx="112" ry="14" fill="url(#terracottaDarkGrad)" stroke="#431407" strokeWidth="1.2" />
      <path
        d="M 120 414 Q 230 432 340 414 L 334 424 Q 230 442 126 424 Z"
        fill="url(#terracottaDarkGrad)"
        stroke="#431407"
        strokeWidth="1.2"
      />

      {/* Wide 20L Pot Body with Terracotta Shading */}
      <path
        d="M 110 324 Q 120 380 142 414 Q 230 428 318 414 Q 340 380 350 324 Z"
        fill="url(#terracottaBodyGrad)"
        stroke="#7c2d12"
        strokeWidth="1.5"
      />

      {/* Terracotta Grain & Specular Highlight */}
      <path
        d="M 142 334 Q 152 376 166 404"
        fill="none"
        stroke="rgba(255, 255, 255, 0.42)"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Sturdy Bevelled Pot Rim Collar */}
      <path
        d="M 100 312 Q 230 326 360 312 L 360 326 Q 230 340 100 326 Z"
        fill="url(#terracottaRimGrad)"
        stroke="#7c2d12"
        strokeWidth="1.2"
      />
      <ellipse cx="230" cy="312" rx="130" ry="16" fill="url(#terracottaRimGrad)" stroke="#7c2d12" strokeWidth="1.2" />

      {/* Organic Rich Potting Soil Bed (20L Buffer Zone) */}
      <ellipse cx="230" cy="314" rx="120" ry="14" fill={soilGradId} stroke="#1a120b" strokeWidth="1" />

      {/* Mulch Texture & Wood Chip Specks */}
      <path d="M 148 316 Q 156 313 164 317 Q 156 320 148 316 Z" fill="#3a2012" />
      <path d="M 288 315 Q 298 313 308 316 Q 298 319 288 315 Z" fill="#3a2012" />
      <path d="M 188 318 Q 198 315 208 319 Q 198 322 188 318 Z" fill="#54321d" />
      <path d="M 250 317 Q 260 314 270 318 Q 260 321 250 317 Z" fill="#54321d" />
      {/* White Perlite Specks for Soil Aeration */}
      <circle cx="138" cy="315" r="1.6" fill="#e2e8f0" opacity="0.65" />
      <circle cx="174" cy="319" r="1.4" fill="#e2e8f0" opacity="0.65" />
      <circle cx="276" cy="316" r="1.6" fill="#e2e8f0" opacity="0.65" />
      <circle cx="320" cy="314" r="1.4" fill="#e2e8f0" opacity="0.65" />

      {/* Stem Crown / Root Flare Shadow */}
      <ellipse cx="228" cy="318" rx="18" ry="5" fill="rgba(0, 0, 0, 0.5)" />

      {/* Capacitive IoT Moisture Probe in Root Zone */}
      <g transform="translate(152, 294)">
        <rect x="0" y="0" width="9" height="26" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
        <line x1="4.5" y1="2" x2="4.5" y2="24" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="4.5" cy="4.5" r="1.6" fill="#10b981" />
      </g>

      {/* Precision Micro-Drip Irrigation Line & Emitter */}
      <path
        d="M 98 328 Q 130 318 172 314"
        fill="none"
        stroke="#0f172a"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="172" cy="314" r="3.4" fill="#0284c7" stroke="#0c4a6e" strokeWidth="0.8" />

      {/* Animated Water Drips & Soil Ripples when Dispensing */}
      {watering && (
        <g transform="translate(172, 314)">
          <motion.circle
            cx="0"
            cy="0"
            r="3.5"
            fill="#38bdf8"
            animate={{ y: [0, 18], opacity: [1, 0], scale: [1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeIn' }}
          />
          <motion.ellipse
            cx="0"
            cy="18"
            rx="7"
            ry="2.5"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.4"
            animate={{ rx: [2, 16], ry: [0.6, 4.5], opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
        </g>
      )}
    </g>
  );
};

/**
 * 8. Status Toolbar Badge
 */
const PlantStatus = ({ status = 'healthy', isWatering = false, isHeatStressed = false, labels = {} }) => {
  if (isWatering) {
    return (
      <div className="toolbar-status-badge status-watering">
        <Droplets size={13} className="status-watering-icon" />
        <span>{labels?.watering || 'Watering in Progress'}</span>
        <span className="status-dot pulse" />
      </div>
    );
  }

  if (isHeatStressed) {
    return (
      <div className="toolbar-status-badge status-dry">
        <Flame size={13} className="text-red-500" />
        <span>Heat Stress (Leaves Curled)</span>
        <span className="status-dot" />
      </div>
    );
  }

  if (status === 'dry') {
    return (
      <div className="toolbar-status-badge status-dry">
        <AlertTriangle size={13} />
        <span>{labels?.dry || 'Needs Water (Dry Droop)'}</span>
        <span className="status-dot" />
      </div>
    );
  }

  if (status === 'moderate') {
    return (
      <div className="toolbar-status-badge status-moderate">
        <AlertCircle size={13} />
        <span>{labels?.moderate || 'Drip Recommended'}</span>
        <span className="status-dot" />
      </div>
    );
  }

  if (status === 'wet') {
    return (
      <div className="toolbar-status-badge status-wet">
        <Droplets size={13} />
        <span>{labels?.wet || 'Soil Saturated'}</span>
        <span className="status-dot" />
      </div>
    );
  }

  return (
    <div className="toolbar-status-badge status-healthy">
      <Sprout size={13} />
      <span>{labels?.healthy || 'Optimal Growth (Lush)'}</span>
      <span className="status-dot pulse" />
    </div>
  );
};

/**
 * 9. Interactive Hotspot Pin
 */
const SensorHotspot = ({
  id,
  type,
  top,
  left,
  title,
  isActive,
  onToggle,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'moisture':
        return <Droplets size={14} />;
      case 'temperature':
        return <Thermometer size={14} />;
      case 'light':
        return <Sun size={14} />;
      default:
        return <Activity size={14} />;
    }
  };

  return (
    <div className="hotspot-node" style={{ top, left }}>
      <button
        type="button"
        className={`hotspot-trigger-btn spot-${type} ${isActive ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(id);
        }}
        aria-label={`View ${title} telemetry`}
        title={title}
      >
        {getIcon()}
        {isActive && <span className="hotspot-pulse-ring" />}
      </button>
    </div>
  );
};

/**
 * 10. Telemetry Inspector Popup Dock
 */
const SensorInspectorPanel = ({
  activeSensor,
  sensors,
  labels,
  onClose,
}) => {
  if (!activeSensor) return null;

  const m = Number(sensors?.moisture ?? 45);
  const t = Number(sensors?.temperature ?? 28);
  const lux = Number(sensors?.lux ?? sensors?.light ?? 650);

  let sensorConfig = {
    title: labels?.soilMoisture || 'Soil Moisture',
    value: `${m.toFixed(1)}%`,
    icon: <Droplets size={16} className="text-sky-500" />,
    badgeClass: m < 40 ? 'tag-amber' : m > 70 ? 'tag-amber' : 'tag-green',
    statusText:
      m < 40
        ? 'Needs Water'
        : m < 50
        ? 'Moderate Dry'
        : m > 70
        ? 'High Moisture'
        : 'Optimal Moisture',
    target: `Target: ${TOMATO_THRESHOLDS.moisture.optimalMin}-${TOMATO_THRESHOLDS.moisture.optimalMax}%`,
    tip: 'Deep 20L root buffer maintains steady calcium flow, preventing blossom end rot.',
  };

  if (activeSensor === 'temperature') {
    const isCold = t < 18;
    const isHot = t > 32;
    sensorConfig = {
      title: labels?.temperature || 'Canopy Temperature',
      value: `${t.toFixed(1)}°C`,
      icon: <Thermometer size={16} className="text-orange-500" />,
      badgeClass: isCold ? 'tag-amber' : isHot ? 'tag-red' : 'tag-green',
      statusText: isCold ? 'Cool Condition' : isHot ? 'Heat Stress (>32°C)' : 'Optimal Temp',
      target: `Target: ${TOMATO_THRESHOLDS.temperature.optimalMin}-${TOMATO_THRESHOLDS.temperature.optimalMax}°C`,
      tip: 'Mild 22–30°C temperature preserves flower pollen fertility and fruit set.',
    };
  } else if (activeSensor === 'light') {
    const isLow = lux < 300;
    sensorConfig = {
      title: labels?.light || 'Sunlight Intensity',
      value: `${Math.round(lux)} lux`,
      icon: <Sun size={16} className="text-amber-500" />,
      badgeClass: isLow ? 'tag-amber' : 'tag-green',
      statusText: isLow ? 'Low Balcony Light' : 'Full Sun Exposure',
      target: 'Target: > 500 lux (Direct Sun)',
      tip: 'Direct sunlight drives lycopene synthesis for sweeter, vibrant red tomatoes.',
    };
  }

  return (
    <motion.div
      className="sensor-inspector-dock"
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="inspector-top-row">
        <div className="inspector-title-group">
          {sensorConfig.icon}
          <span className="inspector-sensor-title">{sensorConfig.title}</span>
        </div>
        <button
          type="button"
          className="inspector-btn-close"
          onClick={onClose}
          aria-label="Close telemetry info"
        >
          <X size={14} />
        </button>
      </div>

      <div className="inspector-metrics-row">
        <span className="inspector-big-val">{sensorConfig.value}</span>
        <span className={`inspector-status-badge ${sensorConfig.badgeClass}`}>
          {sensorConfig.statusText}
        </span>
      </div>

      <div className="inspector-footer-info">
        <span className="inspector-target-range">{sensorConfig.target}</span>
        <p className="inspector-agronomy-tip">{sensorConfig.tip}</p>
      </div>
    </motion.div>
  );
};

/**
 * MAIN COMPONENT: TomatoPlantSVG
 * Ultra-detailed Botanical Solanum lycopersicum Specimen
 * Features:
 * - Real-time visual impact from care controls (watering, temperature, sunlight)
 * - Immediate leaf recovery (yellow droop -> emerald perky)
 * - Heat-stress leaf curling (38°C -> 25°C uncurl)
 * - Sunburst golden aura & fruit glint
 */
const TomatoPlantSVG = ({
  sensors = { moisture: 41.8, temperature: 29.7, humidity: 46.4, lux: 672 },
  watering = false,
  labels = {},
  onHotspot,
}) => {
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Care Simulation Interactive Mode:
  // Initial state has mild dry condition so user can immediately test watering and see leaves recover!
  const [careState, setCareState] = useState({
    isWatered: false, // false = dry condition (yellow drooping leaves), true = lush hydrated green
    isHeatStressed: false, // true = 38°C leaves curled, false = 25°C uncurled broad
    isSunBoost: true, // true = 850 lx golden sun aura, false = 220 lx shade
    isDripping: false, // true for 3s during active watering dispense
  });

  const rawM = Number(sensors?.moisture ?? 45);
  const rawT = Number(sensors?.temperature ?? 28);
  const rawLux = Number(sensors?.lux ?? sensors?.light ?? 650);

  // Compute effective telemetry values based on active care state
  const m = careState.isWatered ? 64.5 : (rawM < 45 ? rawM : 34.0);
  const t = careState.isHeatStressed ? 38.0 : (rawT > 32 ? rawT : 25.5);
  const lux = careState.isSunBoost ? 850 : 220;

  const isActivelyDripping = Boolean(watering || careState.isDripping);
  const isHeatStressed = careState.isHeatStressed || t > 32;
  const isChlorosis = !careState.isWatered && m < 45;
  const droopFactor = isChlorosis ? 18 : 0;

  // Compute Health Score & Status
  const healthScore = useMemo(() => {
    let score = 95;
    if (isChlorosis) score -= 25;
    if (isHeatStressed) score -= 20;
    if (!careState.isSunBoost) score -= 10;
    return Math.max(45, Math.min(100, score));
  }, [isChlorosis, isHeatStressed, careState.isSunBoost]);

  const plantCondition = isActivelyDripping
    ? 'watering'
    : isChlorosis
    ? 'dry'
    : isHeatStressed
    ? 'moderate'
    : 'healthy';

  const leafColorGrad = isChlorosis ? 'url(#leafGradDry)' : 'url(#leafGradHealthy)';
  const bgLeafGrad = isChlorosis ? 'url(#leafGradDryBg)' : 'url(#leafGradHealthyBg)';

  // Action Triggers with Dramatic Visual Changes
  const handleToggleWater = () => {
    if (!careState.isWatered) {
      // User presses "Water Plant": Trigger water drop animation for 3s and turn leaves lush green!
      setCareState((prev) => ({ ...prev, isWatered: true, isDripping: true }));
      setTimeout(() => {
        setCareState((prev) => ({ ...prev, isDripping: false }));
      }, 3000);
    } else {
      // Toggle back to dry drought condition
      setCareState((prev) => ({ ...prev, isWatered: false, isDripping: false }));
    }
  };

  const handleToggleTemp = () => {
    setCareState((prev) => ({ ...prev, isHeatStressed: !prev.isHeatStressed }));
  };

  const handleToggleSun = () => {
    setCareState((prev) => ({ ...prev, isSunBoost: !prev.isSunBoost }));
  };

  const handleResetToLive = () => {
    setCareState({
      isWatered: rawM >= 45,
      isHeatStressed: rawT > 32,
      isSunBoost: rawLux >= 500,
      isDripping: false,
    });
  };

  const toggleHotspot = useCallback(
    (id) => {
      setActiveHotspot((prev) => (prev === id ? null : id));
      if (onHotspot) onHotspot(id);
    },
    [onHotspot]
  );

  const closeHotspot = useCallback(() => {
    setActiveHotspot(null);
  }, []);

  return (
    <div className="tomato-svg-card" onClick={closeHotspot}>
      {/* 1. Header Status Toolbar with Live Health Meter */}
      <div className="plant-svg-toolbar" onClick={(e) => e.stopPropagation()}>
        <PlantStatus
          status={plantCondition}
          isWatering={isActivelyDripping}
          isHeatStressed={isHeatStressed}
          labels={labels}
        />

        {/* Live Plant Health Vitality Meter */}
        <div className="plant-health-meter-pill" title="Plant Vitality Score">
          <Heart size={12} className={healthScore > 80 ? 'text-emerald-500' : 'text-amber-500'} />
          <span>Health: <strong>{healthScore}%</strong></span>
          <div className="health-bar-track">
            <div
              className={`health-bar-fill ${healthScore > 80 ? 'bg-emerald-500' : healthScore > 65 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Plant Viewport & SVG Scene */}
      <div className="plant-svg-viewport">
        <svg
          viewBox="0 0 460 440"
          className="plant-main-svg"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Lush Botanical Leaf Gradients */}
            <linearGradient id="leafGradHealthy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="35%" stopColor="#22c55e" />
              <stop offset="75%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#052e16" />
            </linearGradient>

            <linearGradient id="leafGradHealthyBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="60%" stopColor="#14532d" />
              <stop offset="100%" stopColor="#022c14" />
            </linearGradient>

            <linearGradient id="leafGradModerate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="45%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="leafGradModerateBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#0f4625" />
            </linearGradient>

            <linearGradient id="leafGradDry" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#3f6212" />
            </linearGradient>

            <linearGradient id="leafGradDryBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#365314" />
            </linearGradient>

            {/* Chlorosis Yellowing Leaf Gradient (Noticeable Yellow / Drought Stress) */}
            <linearGradient id="leafGradChlorosis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#65a30d" />
            </linearGradient>

            {/* Thick Purplish-Green Organic Stem Gradient */}
            <linearGradient id="stemOrganicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2e1026" />
              <stop offset="15%" stopColor="#365314" />
              <stop offset="40%" stopColor="#22c55e" />
              <stop offset="70%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#241221" />
            </linearGradient>

            {/* Bamboo Cage Stakes */}
            <linearGradient id="stakeDarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="35%" stopColor="#78350f" />
              <stop offset="70%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            <linearGradient id="stakeLightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="30%" stopColor="#b45309" />
              <stop offset="65%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Ripe Crimson Tomato Sphere (Plump & Glossy) */}
            <radialGradient id="tomatoRipeGrad" cx="30%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#ff8a80" />
              <stop offset="18%" stopColor="#f43f5e" />
              <stop offset="62%" stopColor="#dc2626" />
              <stop offset="88%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>

            {/* Sunset Orange Turning Tomato */}
            <radialGradient id="tomatoTurningGrad" cx="30%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#fb923c" />
              <stop offset="68%" stopColor="#ea580c" />
              <stop offset="90%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#431407" />
            </radialGradient>

            {/* Breaker Stage Yellow-Orange Tomato */}
            <radialGradient id="tomatoBreakerGrad" cx="30%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="28%" stopColor="#facc15" />
              <stop offset="72%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            {/* Glossy Green Baby Tomato */}
            <radialGradient id="tomatoGreenGrad" cx="30%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#d9f99d" />
              <stop offset="28%" stopColor="#84cc16" />
              <stop offset="72%" stopColor="#4d7c0f" />
              <stop offset="95%" stopColor="#1e3a07" />
              <stop offset="100%" stopColor="#0d1b03" />
            </radialGradient>

            {/* Swept-back Flower Petal Radial */}
            <radialGradient id="flowerYellowGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="45%" stopColor="#fde047" />
              <stop offset="85%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>

            {/* Conical Anther Cone Gradient */}
            <linearGradient id="antherConeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>

            {/* Sunburst Golden Aura Radial Overlay */}
            <radialGradient id="sunGlowOverlay" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#facc15" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
            </radialGradient>

            {/* 20L Terracotta Planter Gradients */}
            <linearGradient id="terracottaBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c2d12" />
              <stop offset="18%" stopColor="#c2410c" />
              <stop offset="48%" stopColor="#ea580c" />
              <stop offset="82%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#6c250e" />
            </linearGradient>

            <linearGradient id="terracottaRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6c250e" />
              <stop offset="18%" stopColor="#c2410c" />
              <stop offset="48%" stopColor="#fb923c" />
              <stop offset="82%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#6c250e" />
            </linearGradient>

            <linearGradient id="terracottaDarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#381106" />
              <stop offset="50%" stopColor="#7c2d12" />
              <stop offset="100%" stopColor="#381106" />
            </linearGradient>

            {/* Potting Soil Gradients (Shifts distinctly between dry tan and rich moist dark) */}
            <radialGradient id="soilOptimalGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b241c" />
              <stop offset="65%" stopColor="#251713" />
              <stop offset="100%" stopColor="#150c09" />
            </radialGradient>

            <radialGradient id="soilDryGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#713f12" />
              <stop offset="50%" stopColor="#5c3818" />
              <stop offset="85%" stopColor="#3e2410" />
              <stop offset="100%" stopColor="#281507" />
            </radialGradient>

            <radialGradient id="soilWetGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Drop Shadows */}
            <filter id="leafDropShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodColor="#062814" floodOpacity="0.25" />
            </filter>
            <filter id="fruitSubtleGlow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2.4" stdDeviation="2.4" floodColor="#7f1d1d" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Golden Sunlight Aura Overlay when Sun Boost is ON */}
          {careState.isSunBoost && (
            <motion.circle
              cx="230"
              cy="90"
              r="150"
              fill="url(#sunGlowOverlay)"
              animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* 1. Sturdy Tomato Cage & Support Trellis */}
          <SturdyTomatoCage />

          {/* 2. Big 20L Terracotta Planter Pot with Mulch Soil Base */}
          <BigPlanterContainer20L soilMoisture={m} watering={isActivelyDripping} />

          {/* 3. Lush Asymmetrical Botanical Tomato Canopy */}
          <g id="botanical-tomato-specimen">
            {/* BACKGROUND FOLIAGE LAYER */}
            <g id="canopy-bg-depth">
              <PinnateCompoundLeaf
                originX={216}
                originY={276}
                length={98}
                angle={28}
                droopAngle={droopFactor * 1.1}
                flip={true}
                swayDuration={5.6}
                swayDelay={0.4}
                leafColorGrad={bgLeafGrad}
                curveOffset={14}
                scale={1.02}
                curled={isHeatStressed}
                chlorosis={isChlorosis}
              />
              <PinnateCompoundLeaf
                originX={244}
                originY={270}
                length={94}
                angle={24}
                droopAngle={droopFactor * 1.1}
                flip={false}
                swayDuration={5.8}
                swayDelay={0.9}
                leafColorGrad={bgLeafGrad}
                curveOffset={14}
                scale={1.02}
                curled={isHeatStressed}
                chlorosis={isChlorosis}
              />
              <PinnateCompoundLeaf
                originX={220}
                originY={194}
                length={90}
                angle={32}
                droopAngle={droopFactor * 0.8}
                flip={true}
                swayDuration={5.1}
                swayDelay={0.6}
                leafColorGrad={bgLeafGrad}
                curveOffset={12}
                scale={0.95}
                curled={isHeatStressed}
              />
              <PinnateCompoundLeaf
                originX={242}
                originY={182}
                length={92}
                angle={30}
                droopAngle={droopFactor * 0.75}
                flip={false}
                swayDuration={5.3}
                swayDelay={0.2}
                leafColorGrad={bgLeafGrad}
                curveOffset={12}
                scale={0.95}
                curled={isHeatStressed}
              />
              <PinnateCompoundLeaf
                originX={224}
                originY={130}
                length={78}
                angle={36}
                droopAngle={droopFactor * 0.6}
                flip={true}
                swayDuration={4.6}
                swayDelay={0.5}
                leafColorGrad={bgLeafGrad}
                curveOffset={10}
                scale={0.88}
                curled={isHeatStressed}
              />
              <PinnateCompoundLeaf
                originX={238}
                originY={120}
                length={76}
                angle={34}
                droopAngle={droopFactor * 0.55}
                flip={false}
                swayDuration={4.8}
                swayDelay={0.8}
                leafColorGrad={bgLeafGrad}
                curveOffset={10}
                scale={0.88}
                curled={isHeatStressed}
              />
            </g>

            {/* Main Thick Branching Purplish-Green Trunk */}
            <path
              d="M 226 318 Q 214 250 228 210"
              fill="none"
              stroke="url(#stemOrganicGrad)"
              strokeWidth="13"
              strokeLinecap="round"
            />
            {/* Fork into Left Leader */}
            <path
              d="M 228 210 Q 186 195 160 180"
              fill="none"
              stroke="url(#stemOrganicGrad)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Fork into Right Leader */}
            <path
              d="M 228 210 Q 268 185 292 165"
              fill="none"
              stroke="url(#stemOrganicGrad)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Central Leader ascending to Apex */}
            <path
              d="M 228 210 Q 236 140 230 48"
              fill="none"
              stroke="url(#stemOrganicGrad)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Vine Specular Highlights */}
            <path
              d="M 224 314 Q 213 250 226 210 Q 234 140 228 52"
              fill="none"
              stroke="rgba(255, 255, 255, 0.38)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Axillary Sucker Shoot (Pruning Cue at Mid-Right Node) */}
            <AxillarySucker originX={236} originY={218} />

            {/* FOREGROUND ASYMMETRICAL CANOPY SPRAYS */}

            {/* Lower-Left Heavy Fruit Branch (Droops down when dry; perks up when watered) */}
            <PinnateCompoundLeaf
              originX={214}
              originY={294}
              length={112}
              angle={12}
              droopAngle={droopFactor * 1.4 + (isChlorosis ? 14 : 0)}
              flip={true}
              swayDuration={5.2}
              swayDelay={0.1}
              leafColorGrad={isChlorosis ? 'url(#leafGradChlorosis)' : leafColorGrad}
              curveOffset={10}
              scale={1.1}
              curled={isHeatStressed}
              chlorosis={isChlorosis}
            />

            {/* Lower-Right Spilling Foliage */}
            <PinnateCompoundLeaf
              originX={238}
              originY={286}
              length={106}
              angle={15}
              droopAngle={droopFactor * 1.2 + (isChlorosis ? 12 : 0)}
              flip={false}
              swayDuration={5.4}
              swayDelay={0.7}
              leafColorGrad={isChlorosis ? 'url(#leafGradChlorosis)' : leafColorGrad}
              curveOffset={10}
              scale={1.06}
              curled={isHeatStressed}
              chlorosis={isChlorosis}
            />

            {/* Mid-Left Bushy Canopy */}
            <PinnateCompoundLeaf
              originX={190}
              originY={215}
              length={98}
              angle={20}
              droopAngle={droopFactor * 0.9}
              flip={true}
              swayDuration={4.8}
              swayDelay={0.3}
              leafColorGrad={leafColorGrad}
              curveOffset={12}
              scale={1.02}
              curled={isHeatStressed}
            />

            {/* Mid-Right Vigorous Lateral Shoot */}
            <PinnateCompoundLeaf
              originX={252}
              originY={195}
              length={104}
              angle={24}
              droopAngle={droopFactor * 0.85}
              flip={false}
              swayDuration={5.0}
              swayDelay={0.8}
              leafColorGrad={leafColorGrad}
              curveOffset={12}
              scale={1.04}
              curled={isHeatStressed}
            />

            {/* Mid-Upper Canopy */}
            <PinnateCompoundLeaf
              originX={222}
              originY={154}
              length={88}
              angle={26}
              droopAngle={droopFactor * 0.7}
              flip={true}
              swayDuration={4.4}
              swayDelay={0.5}
              leafColorGrad={leafColorGrad}
              curveOffset={10}
              scale={0.92}
              curled={isHeatStressed}
            />
            <PinnateCompoundLeaf
              originX={238}
              originY={142}
              length={86}
              angle={23}
              droopAngle={droopFactor * 0.65}
              flip={false}
              swayDuration={4.6}
              swayDelay={0.2}
              leafColorGrad={leafColorGrad}
              curveOffset={10}
              scale={0.92}
              curled={isHeatStressed}
            />

            {/* Upper Apex Canopy */}
            <PinnateCompoundLeaf
              originX={226}
              originY={98}
              length={72}
              angle={30}
              droopAngle={droopFactor * 0.5}
              flip={true}
              swayDuration={4.0}
              swayDelay={0.3}
              leafColorGrad={leafColorGrad}
              curveOffset={8}
              scale={0.82}
              curled={isHeatStressed}
            />
            <PinnateCompoundLeaf
              originX={234}
              originY={88}
              length={70}
              angle={28}
              droopAngle={droopFactor * 0.45}
              flip={false}
              swayDuration={4.2}
              swayDelay={0.7}
              leafColorGrad={leafColorGrad}
              curveOffset={8}
              scale={0.82}
              curled={isHeatStressed}
            />

            {/* Apex Tender Shoot Top */}
            <g transform="translate(230, 48)">
              <g transform="rotate(-38) scale(0.72)">
                <SingleLeaflet length={32} width={13} fill={leafColorGrad} curled={isHeatStressed} />
              </g>
              <g transform="rotate(38) scale(0.72)">
                <SingleLeaflet length={32} width={13} fill={leafColorGrad} curled={isHeatStressed} />
              </g>
              <g transform="rotate(-90) scale(0.66)">
                <SingleLeaflet length={30} width={13} fill={leafColorGrad} curled={isHeatStressed} />
              </g>
            </g>

            {/* 4. Tomato Fruit Trusses (Hanging Naturally with Size Variety Across Stages) */}

            {/* Truss A: Ruby Ripe Crimson Tomatoes (Lower Left Truss) */}
            <g transform="translate(196, 238)">
              <path
                d="M 0 0 Q -14 14 -22 38 T -32 64"
                fill="none"
                stroke="#1b4332"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <GlossyTomato cx={-18} cy={36} r={26} stage="ripe" hangAngle={-5} swayDelay={0.2} glowBoost={careState.isSunBoost} />
              <GlossyTomato cx={-36} cy={66} r={21} stage="ripe" hangAngle={4} swayDelay={0.5} glowBoost={careState.isSunBoost} />
              <GlossyTomato cx={5} cy={46} r={17} stage="ripe" hangAngle={2} swayDelay={0.8} glowBoost={careState.isSunBoost} />
              <GlossyTomato cx={-6} cy={82} r={12} stage="ripe" hangAngle={-2} swayDelay={1.1} glowBoost={careState.isSunBoost} />
            </g>

            {/* Truss B: Sunset Orange & Breaker Tomatoes (Mid-Right Truss) */}
            <g transform="translate(254, 180)">
              <path
                d="M 0 0 Q 16 12 26 34 T 36 58"
                fill="none"
                stroke="#1b4332"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <GlossyTomato cx={22} cy={32} r={22} stage="turning" hangAngle={-3} swayDelay={0.3} glowBoost={careState.isSunBoost} />
              <GlossyTomato cx={40} cy={60} r={18} stage="breaker" hangAngle={5} swayDelay={0.6} glowBoost={careState.isSunBoost} />
              <GlossyTomato cx={6} cy={48} r={13} stage="green" hangAngle={-1} swayDelay={0.9} glowBoost={careState.isSunBoost} />
            </g>

            {/* Truss C: Baby Green Fruitlets (Upper-Mid Left Truss) */}
            <g transform="translate(220, 126)">
              <path
                d="M 0 0 Q -12 10 -20 26"
                fill="none"
                stroke="#1b4332"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <GlossyTomato cx={-20} cy={28} r={14} stage="green" hangAngle={-2} swayDelay={0.7} />
              <GlossyTomato cx={-4} cy={38} r={10} stage="green" hangAngle={3} swayDelay={1.1} />
            </g>

            {/* Truss D: Tiny Green Fruitlets near Apex */}
            <g transform="translate(240, 108)">
              <path d="M 0 0 Q 8 6 14 16" fill="none" stroke="#1b4332" strokeWidth="1.8" strokeLinecap="round" />
              <GlossyTomato cx={14} cy={18} r={8.5} stage="green" hangAngle={-1} swayDelay={0.4} />
            </g>

            {/* 5. Golden Star Tomato Blossoms with Swept-back Petals & Anther Cones */}
            <g transform="translate(224, 88)">
              <path d="M 0 0 Q 16 -10 28 -5 T 42 10" fill="none" stroke="#40916c" strokeWidth="2.4" strokeLinecap="round" />
              <BotanicalTomatoFlower originX={24} originY={-7} scale={1.05} swayDelay={0.2} />
              <BotanicalTomatoFlower originX={40} originY={10} scale={0.88} swayDelay={0.5} />
            </g>

            <g transform="translate(236, 68)">
              <path d="M 0 0 Q -14 -8 -24 -3 T -36 12" fill="none" stroke="#40916c" strokeWidth="2.2" strokeLinecap="round" />
              <BotanicalTomatoFlower originX={-22} originY={-5} scale={0.95} swayDelay={0.7} />
            </g>
          </g>
        </svg>

        {/* 4. Balanced Interactive Hotspots */}
        <div className="hotspots-overlay">
          {/* Soil Moisture Pin */}
          <SensorHotspot
            id="moisture"
            type="moisture"
            top="73%"
            left="22%"
            title={labels?.soilMoisture || 'Soil Moisture'}
            isActive={activeHotspot === 'moisture'}
            onToggle={toggleHotspot}
          />

          {/* Temperature Pin */}
          <SensorHotspot
            id="temperature"
            type="temperature"
            top="45%"
            left="82%"
            title={labels?.temperature || 'Canopy Temperature'}
            isActive={activeHotspot === 'temperature'}
            onToggle={toggleHotspot}
          />

          {/* Sunlight Pin */}
          <SensorHotspot
            id="light"
            type="light"
            top="14%"
            left="78%"
            title={labels?.light || 'Sunlight'}
            isActive={activeHotspot === 'light'}
            onToggle={toggleHotspot}
          />
        </div>

        {/* 5. Telemetry Inspector Panel */}
        <AnimatePresence>
          {activeHotspot && (
            <SensorInspectorPanel
              activeSensor={activeHotspot}
              sensors={{ moisture: m, temperature: t, lux }}
              labels={labels}
              onClose={closeHotspot}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 6. Dynamic Interactive Care Action Controls (Single Compact Line) */}
      <div className="plant-svg-care-bar" onClick={(e) => e.stopPropagation()}>
        <div className="care-buttons-group">
          {/* Water Button */}
          <button
            type="button"
            className={`care-action-btn btn-water ${careState.isWatered ? 'active-action' : ''}`}
            onClick={handleToggleWater}
            title={careState.isWatered ? 'Soil hydrated (65%); tap to test drought' : 'Tap to water plant & restore lush green leaves'}
          >
            <Droplets size={12} />
            <span>{careState.isWatered ? 'Water (65%)' : 'Dry (Water)'}</span>
          </button>

          {/* Temperature / Heat Stress Button */}
          <button
            type="button"
            className={`care-action-btn btn-temp ${careState.isHeatStressed ? 'active-action' : ''}`}
            onClick={handleToggleTemp}
            title={careState.isHeatStressed ? 'Tap to cool canopy and uncurl leaves' : 'Tap to test 38°C heat stress leaf curling'}
          >
            <Thermometer size={12} />
            <span>{careState.isHeatStressed ? 'Heat (38°)' : 'Cool (25°)'}</span>
          </button>

          {/* Sun / Light Boost Button */}
          <button
            type="button"
            className={`care-action-btn btn-sun ${careState.isSunBoost ? 'active-action' : ''}`}
            onClick={handleToggleSun}
            title={careState.isSunBoost ? 'Tap for diffuse shade' : 'Tap for full sun'}
          >
            <Sun size={12} />
            <span>{careState.isSunBoost ? 'Sun (850 lx)' : 'Shade (220 lx)'}</span>
          </button>

          {/* Reset Sync Button */}
          <button
            type="button"
            className="care-action-btn btn-reset"
            onClick={handleResetToLive}
            title="Reset to live sensor readings"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>
      </div>


      {/* 7. Footer Quick Telemetry Chips */}
      <div className="plant-svg-footer" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`footer-stat-chip ${activeHotspot === 'moisture' ? 'active-chip' : ''}`}
          onClick={() => toggleHotspot('moisture')}
        >
          <Droplets size={13} className="text-sky-500" />
          <span>Moisture: <strong>{m.toFixed(1)}%</strong></span>
        </button>

        <button
          type="button"
          className={`footer-stat-chip ${activeHotspot === 'temperature' ? 'active-chip' : ''}`}
          onClick={() => toggleHotspot('temperature')}
        >
          <Thermometer size={13} className="text-orange-500" />
          <span>Temp: <strong>{t.toFixed(1)}°C</strong></span>
        </button>

        <button
          type="button"
          className={`footer-stat-chip ${activeHotspot === 'light' ? 'active-chip' : ''}`}
          onClick={() => toggleHotspot('light')}
        >
          <Sun size={13} className="text-amber-500" />
          <span>Light: <strong>{Math.round(lux)} lux</strong></span>
        </button>
      </div>
    </div>
  );
};

export default TomatoPlantSVG;

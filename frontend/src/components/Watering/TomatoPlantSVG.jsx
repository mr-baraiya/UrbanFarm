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
  Activity
} from 'lucide-react';
import { TOMATO_THRESHOLDS } from '../../utils/plantStatus';
import './TomatoPlantSVG.css';

/**
 * Botanical Serrated Tomato Leaflet
 */
const LeafletBlade = ({ length = 34, width = 17, fill = "url(#leafGradientHealthy)" }) => (
  <g className="leaflet-blade">
    {/* Serrated Leaflet Silhouette */}
    <path
      d={`M 0 0 
          C ${length * 0.22} ${-width * 0.75}, ${length * 0.52} ${-width * 0.88}, ${length * 0.72} ${-width * 0.58} 
          C ${length * 0.65} ${-width * 0.22}, ${length * 0.88} 0, ${length} 0 
          C ${length * 0.88} 0, ${length * 0.65} ${width * 0.22}, ${length * 0.72} ${width * 0.58} 
          C ${length * 0.52} ${width * 0.88}, ${length * 0.22} ${width * 0.75}, 0 0 Z`}
      fill={fill}
      stroke="#143625"
      strokeWidth="0.8"
      filter="url(#subtleLeafShadow)"
    />
    {/* Central Primary Vein */}
    <path
      d={`M 0 0 C ${length * 0.35} 0, ${length * 0.75} 0, ${length * 0.95} 0`}
      fill="none"
      stroke="#86efac"
      strokeWidth="1.1"
      strokeLinecap="round"
      opacity="0.85"
    />
    {/* Lateral Secondary Veins */}
    <path
      d={`M ${length * 0.22} 0 Q ${length * 0.35} ${-width * 0.35} ${length * 0.48} ${-width * 0.45}
          M ${length * 0.48} 0 Q ${length * 0.62} ${-width * 0.32} ${length * 0.72} ${-width * 0.38}
          M ${length * 0.22} 0 Q ${length * 0.35} ${width * 0.35} ${length * 0.48} ${width * 0.45}
          M ${length * 0.48} 0 Q ${length * 0.62} ${width * 0.32} ${length * 0.72} ${width * 0.38}`}
      fill="none"
      stroke="#bbf7d0"
      strokeWidth="0.65"
      strokeLinecap="round"
      opacity="0.75"
    />
  </g>
);

/**
 * TomatoCompoundBranch - Lush arched compound leaf cluster
 */
export const TomatoCompoundBranch = ({
  originX = 200,
  originY = 200,
  length = 80,
  angle = 25,
  droopAngle = 0,
  flip = false,
  swayDuration = 4.8,
  swayDelay = 0,
  leafColorGrad = "url(#leafGradientHealthy)"
}) => {
  const baseAngle = flip ? -angle : angle;
  const currentDroop = flip ? -droopAngle : droopAngle;
  const totalAngle = baseAngle + currentDroop;

  return (
    <g transform={`translate(${originX}, ${originY})`}>
      <motion.g
        animate={{
          rotate: [totalAngle - 1.5, totalAngle + 1.8, totalAngle - 1.5],
        }}
        transition={{
          duration: swayDuration,
          delay: swayDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <g transform={`scale(${flip ? -1 : 1}, 1)`}>
          {/* Main Arched Leaf Petiole / Rachis */}
          <path
            d={`M 0 0 C ${length * 0.25} -6, ${length * 0.6} 2, ${length} 14`}
            fill="none"
            stroke="#2d6a4f"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Basal Leaflet Pair (30% along branch) */}
          <g transform={`translate(${length * 0.28}, -2)`}>
            <g transform="rotate(-42) scale(0.65)">
              <LeafletBlade length={28} width={14} fill={leafColorGrad} />
            </g>
            <g transform="rotate(40) scale(0.65)">
              <LeafletBlade length={28} width={14} fill={leafColorGrad} />
            </g>
          </g>

          {/* Middle Leaflet Pair (62% along branch) */}
          <g transform={`translate(${length * 0.62}, 4)`}>
            <g transform="rotate(-30) scale(0.85)">
              <LeafletBlade length={34} width={16} fill={leafColorGrad} />
            </g>
            <g transform="rotate(32) scale(0.85)">
              <LeafletBlade length={34} width={16} fill={leafColorGrad} />
            </g>
          </g>

          {/* Intercalary Small Leaflets */}
          <g transform={`translate(${length * 0.45}, 1) rotate(-55) scale(0.42)`}>
            <LeafletBlade length={22} width={10} fill={leafColorGrad} />
          </g>
          <g transform={`translate(${length * 0.45}, 1) rotate(55) scale(0.42)`}>
            <LeafletBlade length={22} width={10} fill={leafColorGrad} />
          </g>

          {/* Large Terminal Leaflet at Tip */}
          <g transform={`translate(${length}, 14) rotate(10) scale(1.05)`}>
            <LeafletBlade length={40} width={18} fill={leafColorGrad} />
          </g>
        </g>
      </motion.g>
    </g>
  );
};

/**
 * Botanical Tomato Fruit with 3D Gloss, Depth Rim & Star Calyx
 */
export const TomatoFruit = ({
  cx = 0,
  cy = 0,
  r = 16,
  stage = 'ripe', // 'ripe' | 'turning' | 'green'
  hangAngle = 0,
  swayDelay = 0
}) => {
  const gradId = stage === 'ripe'
    ? 'url(#tomatoRipeGrad)'
    : stage === 'turning'
      ? 'url(#tomatoTurningGrad)'
      : 'url(#tomatoGreenGrad)';

  const pivotX = cx;
  const pivotY = cy - r - 6;

  return (
    <g transform={`translate(${pivotX}, ${pivotY})`}>
      <motion.g
        animate={{
          y: [-0.6, 0.8, -0.6],
          rotate: [hangAngle - 1.2, hangAngle + 1.4, hangAngle - 1.2],
        }}
        transition={{
          duration: 5.2,
          delay: swayDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <g transform={`translate(${-pivotX}, ${-pivotY})`}>
          {/* Fruit Stalk */}
          <path
            d={`M ${cx} ${cy - r - 7} Q ${cx - 3} ${cy - r - 3} ${cx} ${cy - r}`}
            fill="none"
            stroke="#2d6a4f"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Tomato Body */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={gradId}
            filter="url(#fruitSubtleGlow)"
            stroke={stage === 'ripe' ? '#7f1d1d' : stage === 'turning' ? '#9a3412' : '#27272a'}
            strokeWidth="0.7"
          />

          {/* Specular Curved Highlight */}
          <ellipse
            cx={cx - r * 0.32}
            cy={cy - r * 0.35}
            rx={r * 0.38}
            ry={r * 0.22}
            transform={`rotate(-28, ${cx - r * 0.32}, ${cy - r * 0.35})`}
            fill="#ffffff"
            opacity={stage === 'ripe' ? 0.72 : 0.55}
          />

          {/* Secondary Point Specular */}
          <circle
            cx={cx - r * 0.12}
            cy={cy - r * 0.48}
            r={r * 0.09}
            fill="#ffffff"
            opacity="0.9"
          />

          {/* Bottom Rim Glow */}
          <path
            d={`M ${cx - r * 0.7} ${cy + r * 0.35} A ${r} ${r} 0 0 0 ${cx + r * 0.6} ${cy + r * 0.55}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* 5-Point Star Calyx */}
          <g transform={`translate(${cx}, ${cy - r + 1}) scale(${r / 16})`}>
            <path d="M 0 0 Q -5 -9 -12 -7 Q -6 -2 0 0" fill="#1b4332" stroke="#081c15" strokeWidth="0.5" />
            <path d="M 0 0 Q 5 -9 12 -7 Q 6 -2 0 0" fill="#2d6a4f" stroke="#081c15" strokeWidth="0.5" />
            <path d="M 0 0 Q -9 2 -14 9 Q -6 4 0 0" fill="#1b4332" stroke="#081c15" strokeWidth="0.5" />
            <path d="M 0 0 Q 9 2 14 9 Q 6 4 0 0" fill="#2d6a4f" stroke="#081c15" strokeWidth="0.5" />
            <path d="M 0 0 Q 0 7 0 13 Q -2 5 0 0" fill="#40916c" stroke="#081c15" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="2.2" fill="#081c15" />
          </g>
        </g>
      </motion.g>
    </g>
  );
};

/**
 * Botanical Flower Blossom Cluster
 */
export const TomatoBlossomCluster = ({ originX = 200, originY = 120, flip = false, swayDelay = 0 }) => {
  return (
    <g transform={`translate(${originX}, ${originY})`}>
      <g transform={`scale(${flip ? -1 : 1}, 1)`}>
        {/* Blossom Peduncle */}
        <path d="M 0 0 Q 14 -8 24 -3 T 36 8" fill="none" stroke="#40916c" strokeWidth="2.2" strokeLinecap="round" />

        {/* Flower 1 */}
        <g transform="translate(20, -5) scale(0.9)">
          <motion.g
            animate={{ rotate: [-2, 3, -2] }}
            transition={{ duration: 4.2, delay: swayDelay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Green Sepals */}
            <g fill="#2d6a4f">
              {[0, 72, 144, 216, 288].map((rot, i) => (
                <path key={`sep1-${i}`} d="M 0 0 L -2.5 -13 L 0 -10 L 2.5 -13 Z" transform={`rotate(${rot})`} stroke="#1b4332" strokeWidth="0.4" />
              ))}
            </g>
            {/* Bright Yellow Petals */}
            <g fill="url(#flowerYellowGrad)">
              {[0, 72, 144, 216, 288].map((rot, i) => (
                <path key={`pet1-${i}`} d="M 0 0 C -4 -4, -4 -9, 0 -12 C 4 -9, 4 -4, 0 0 Z" transform={`rotate(${rot + 36})`} stroke="#ca8a04" strokeWidth="0.5" />
              ))}
            </g>
            {/* Golden Cone */}
            <circle cx="0" cy="0" r="3.2" fill="#facc15" stroke="#a16207" strokeWidth="0.5" />
          </motion.g>
        </g>

        {/* Flower 2 */}
        <g transform="translate(34, 8) scale(0.75)">
          <motion.g
            animate={{ rotate: [2, -3, 2] }}
            transition={{ duration: 4.5, delay: swayDelay + 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <g fill="#2d6a4f">
              {[0, 72, 144, 216, 288].map((rot, i) => (
                <path key={`sep2-${i}`} d="M 0 0 L -2 -11 L 0 -8 L 2 -11 Z" transform={`rotate(${rot})`} stroke="#1b4332" strokeWidth="0.4" />
              ))}
            </g>
            <g fill="url(#flowerYellowGrad)">
              {[0, 72, 144, 216, 288].map((rot, i) => (
                <path key={`pet2-${i}`} d="M 0 0 C -3.5 -3.5, -3.5 -8, 0 -11 C 3.5 -8, 3.5 -3.5, 0 0 Z" transform={`rotate(${rot + 36})`} stroke="#ca8a04" strokeWidth="0.5" />
              ))}
            </g>
            <circle cx="0" cy="0" r="2.8" fill="#facc15" stroke="#a16207" strokeWidth="0.5" />
          </motion.g>
        </g>
      </g>
    </g>
  );
};

/**
 * Modern Terracotta Pot with Soil, Sensor Probe & Drip Emitter
 */
export const PlantPot = ({ soilMoisture = 45, watering = false }) => {
  const soilGradId = soilMoisture < 40 ? 'url(#soilDryGrad)' : soilMoisture > 70 ? 'url(#soilWetGrad)' : 'url(#soilOptimalGrad)';

  return (
    <g id="tomato-pot-assembly">
      {/* Ground Soft Cast Shadow */}
      <ellipse cx="200" cy="392" rx="115" ry="14" fill="rgba(15, 23, 42, 0.14)" filter="url(#subtleLeafShadow)" />

      {/* Terracotta Saucer Base */}
      <ellipse cx="200" cy="376" rx="84" ry="12" fill="url(#terracottaDarkGrad)" stroke="#541b08" strokeWidth="1" />
      <path
        d="M 124 374 Q 200 392 276 374 L 270 384 Q 200 400 130 384 Z"
        fill="url(#terracottaDarkGrad)"
        stroke="#431407"
        strokeWidth="0.8"
      />

      {/* Terracotta Pot Body (Curved Botanical Taper) */}
      <path
        d="M 112 288 Q 116 338 132 372 Q 200 386 268 372 Q 284 338 288 288 Z"
        fill="url(#terracottaBodyGrad)"
        stroke="#7c2d12"
        strokeWidth="1.2"
      />

      {/* Pot 3D Specular Highlight Curve */}
      <path
        d="M 138 296 Q 146 336 156 364"
        fill="none"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Pot Rim Collar */}
      <path
        d="M 104 278 Q 200 292 296 278 L 296 288 Q 200 302 104 288 Z"
        fill="url(#terracottaRimGrad)"
        stroke="#7c2d12"
        strokeWidth="1"
      />
      <ellipse cx="200" cy="278" rx="96" ry="15" fill="url(#terracottaRimGrad)" stroke="#7c2d12" strokeWidth="1" />

      {/* Rich Potting Soil Bed */}
      <ellipse cx="200" cy="279" rx="88" ry="13" fill={soilGradId} stroke="#1a120b" strokeWidth="1" />

      {/* Soil Texture & Organic Specks */}
      <ellipse cx="160" cy="281" rx="14" ry="3" fill="#140c07" opacity="0.4" />
      <ellipse cx="235" cy="280" rx="18" ry="3" fill="#140c07" opacity="0.4" />
      <ellipse cx="195" cy="284" rx="22" ry="3.5" fill="#140c07" opacity="0.3" />

      {/* Capacitive IoT Moisture Probe in Soil */}
      <g transform="translate(142, 264)">
        {/* Metal PCB Sensor Body */}
        <rect x="0" y="0" width="8" height="26" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
        <line x1="4" y1="2" x2="4" y2="24" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Status LED Blink */}
        <circle cx="4" cy="4" r="1.5" fill="#10b981" />
      </g>

      {/* Black Micro-Drip Tube & Emitter Nozzle */}
      <path
        d="M 96 295 Q 120 286 160 280"
        fill="none"
        stroke="#0f172a"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="160" cy="280" r="3.2" fill="#0284c7" stroke="#0c4a6e" strokeWidth="0.8" />

      {/* Animated Water Drips when Actuator is ON */}
      {watering && (
        <g transform="translate(160, 280)">
          <motion.circle
            cx="0"
            cy="0"
            r="3.5"
            fill="#38bdf8"
            animate={{ y: [0, 14], opacity: [1, 0], scale: [1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeIn' }}
          />
          <motion.ellipse
            cx="0"
            cy="14"
            rx="8"
            ry="2.5"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            animate={{ rx: [2, 12], ry: [0.8, 3.5], opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
        </g>
      )}
    </g>
  );
};

/**
 * PlantStatus Toolbar Chip
 */
export const PlantStatus = ({ status = 'healthy', isWatering = false, labels = {} }) => {
  if (isWatering) {
    return (
      <div className="toolbar-status-badge status-watering">
        <Droplets size={14} className="status-watering-icon" />
        <span>{labels?.watering || 'Watering in Progress'}</span>
        <span className="status-dot pulse" />
      </div>
    );
  }

  if (status === 'dry') {
    return (
      <div className="toolbar-status-badge status-dry">
        <AlertTriangle size={14} />
        <span>{labels?.dry || 'Needs Water (Dry)'}</span>
        <span className="status-dot" />
      </div>
    );
  }

  if (status === 'moderate') {
    return (
      <div className="toolbar-status-badge status-moderate">
        <AlertCircle size={14} />
        <span>{labels?.moderate || 'Drip Recommended'}</span>
        <span className="status-dot" />
      </div>
    );
  }

  if (status === 'wet') {
    return (
      <div className="toolbar-status-badge status-wet">
        <Droplets size={14} />
        <span>{labels?.wet || 'Soil Saturated'}</span>
        <span className="status-dot" />
      </div>
    );
  }

  return (
    <div className="toolbar-status-badge status-healthy">
      <Sprout size={14} />
      <span>{labels?.healthy || 'Optimal Moisture'}</span>
      <span className="status-dot pulse" />
    </div>
  );
};

/**
 * Interactive Hotspot Pin
 */
export const SensorHotspot = ({
  id,
  type,
  top,
  left,
  title,
  isActive,
  onToggle
}) => {
  const getIcon = () => {
    switch (type) {
      case 'moisture':
        return <Droplets size={15} />;
      case 'temperature':
        return <Thermometer size={15} />;
      case 'light':
        return <Sun size={15} />;
      default:
        return <Activity size={15} />;
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
 * Telemetry Inspector Popup
 */
export const SensorInspectorPanel = ({
  activeSensor,
  sensors,
  labels,
  onClose
}) => {
  if (!activeSensor) return null;

  const m = Number(sensors?.moisture ?? 45);
  const t = Number(sensors?.temperature ?? 28);
  const lux = Number(sensors?.lux ?? sensors?.light ?? 650);

  let sensorConfig = {
    title: labels?.soilMoisture || 'Soil Moisture',
    value: `${m.toFixed(1)}%`,
    icon: <Droplets size={18} className="text-sky-500" />,
    badgeClass: m < 40 ? 'tag-amber' : m > 70 ? 'tag-amber' : 'tag-green',
    statusText: m < 40 ? 'Needs Water' : m < 50 ? 'Moderate Dry' : m > 70 ? 'High Moisture' : 'Optimal Moisture',
    target: `Target: ${TOMATO_THRESHOLDS.moisture.optimalMin}-${TOMATO_THRESHOLDS.moisture.optimalMax}%`,
    tip: 'Steady root-zone hydration ensures calcium uptake and prevents blossom end rot.'
  };

  if (activeSensor === 'temperature') {
    const isCold = t < 18;
    const isHot = t > 32;
    sensorConfig = {
      title: labels?.temperature || 'Canopy Temperature',
      value: `${t.toFixed(1)}°C`,
      icon: <Thermometer size={18} className="text-orange-500" />,
      badgeClass: isCold ? 'tag-amber' : isHot ? 'tag-red' : 'tag-green',
      statusText: isCold ? 'Cool Condition' : isHot ? 'Heat Stress (>32°C)' : 'Optimal Temp',
      target: `Target: ${TOMATO_THRESHOLDS.temperature.optimalMin}-${TOMATO_THRESHOLDS.temperature.optimalMax}°C`,
      tip: 'Mild 22–30°C canopy temperature ensures high tomato flower pollen viability.'
    };
  } else if (activeSensor === 'light') {
    const isLow = lux < 300;
    sensorConfig = {
      title: labels?.light || 'Sunlight Intensity',
      value: `${Math.round(lux)} lux`,
      icon: <Sun size={18} className="text-amber-500" />,
      badgeClass: isLow ? 'tag-amber' : 'tag-green',
      statusText: isLow ? 'Low Balcony Light' : 'Full Sun Exposure',
      target: 'Target: > 500 lux (Direct Sun)',
      tip: 'Full sunlight accelerates lycopene synthesis for sweeter, vibrant red tomatoes.'
    };
  }

  return (
    <motion.div
      className="sensor-inspector-dock"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
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
          <X size={15} />
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
 * Ultra-realistic, Lush, Bushy Botanical Specimen
 */
const TomatoPlantSVG = ({
  sensors = { moisture: 41.8, temperature: 29.7, humidity: 46.4, lux: 672 },
  watering = false,
  labels = {},
  onHotspot,
}) => {
  const [activeHotspot, setActiveHotspot] = useState(null);

  const m = Number(sensors?.moisture ?? 45);
  const t = Number(sensors?.temperature ?? 28);
  const lux = Number(sensors?.lux ?? sensors?.light ?? 650);

  // Compute Moisture Category & Droop Factor
  const { plantCondition, droopFactor, leafColorGrad } = useMemo(() => {
    if (m < 40) {
      const droop = 12 + Math.min(8, (40 - m) * 0.5);
      return {
        plantCondition: 'dry',
        droopFactor: droop,
        leafColorGrad: 'url(#leafGradientDry)',
      };
    }
    if (m < 50) {
      return {
        plantCondition: 'moderate',
        droopFactor: 5,
        leafColorGrad: 'url(#leafGradientModerate)',
      };
    }
    if (m > 70) {
      return {
        plantCondition: 'wet',
        droopFactor: 0,
        leafColorGrad: 'url(#leafGradientHealthy)',
      };
    }
    return {
      plantCondition: 'healthy',
      droopFactor: 0,
      leafColorGrad: 'url(#leafGradientHealthy)',
    };
  }, [m]);

  const toggleHotspot = useCallback((id) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
    if (onHotspot) onHotspot(id);
  }, [onHotspot]);

  const closeHotspot = useCallback(() => {
    setActiveHotspot(null);
  }, []);

  return (
    <div className="tomato-svg-card" onClick={closeHotspot}>
      {/* 1. Header Toolbar */}
      <div className="plant-svg-toolbar" onClick={(e) => e.stopPropagation()}>
        <PlantStatus
          status={plantCondition}
          isWatering={watering}
          labels={labels}
        />
        <div className="toolbar-hint">
          <Sparkles size={14} className="text-emerald-500" />
          <span>{labels?.hintText || 'Tap a sensor pin to inspect live telemetry'}</span>
        </div>
      </div>

      {/* 2. Plant Viewport & SVG Scene */}
      <div className="plant-svg-viewport">
        <svg
          viewBox="0 0 400 420"
          className="plant-main-svg"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SVG Definitions: Gradients & Shaders */}
          <defs>
            {/* Lush Botanical Leaf Gradients */}
            <linearGradient id="leafGradientHealthy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="45%" stopColor="#16a34a" />
              <stop offset="85%" stopColor="#14532d" />
              <stop offset="100%" stopColor="#052e16" />
            </linearGradient>

            <linearGradient id="leafGradientModerate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="45%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="leafGradientDry" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bef264" />
              <stop offset="45%" stopColor="#65a30d" />
              <stop offset="100%" stopColor="#365314" />
            </linearGradient>

            {/* Vine Stem Gradient */}
            <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="35%" stopColor="#22c55e" />
              <stop offset="70%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>

            {/* Bamboo Trellis Stake Gradient */}
            <linearGradient id="bambooStakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="25%" stopColor="#b45309" />
              <stop offset="55%" stopColor="#d97706" />
              <stop offset="85%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Ripe Crimson Tomato */}
            <radialGradient id="tomatoRipeGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>

            {/* Sunset Orange Turning Tomato */}
            <radialGradient id="tomatoTurningGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#f97316" />
              <stop offset="75%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>

            {/* Green Baby Tomato */}
            <radialGradient id="tomatoGreenGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#d9f99d" />
              <stop offset="35%" stopColor="#84cc16" />
              <stop offset="75%" stopColor="#4d7c0f" />
              <stop offset="100%" stopColor="#1a2e05" />
            </radialGradient>

            {/* Flower Yellow Radial */}
            <radialGradient id="flowerYellowGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>

            {/* Terracotta Planter Gradients */}
            <linearGradient id="terracottaBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c2d12" />
              <stop offset="20%" stopColor="#c2410c" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="85%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#6c250e" />
            </linearGradient>

            <linearGradient id="terracottaRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6c250e" />
              <stop offset="20%" stopColor="#c2410c" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="85%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#6c250e" />
            </linearGradient>

            <linearGradient id="terracottaDarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#381106" />
              <stop offset="50%" stopColor="#7c2d12" />
              <stop offset="100%" stopColor="#381106" />
            </linearGradient>

            {/* Soil Gradients */}
            <radialGradient id="soilOptimalGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b241c" />
              <stop offset="70%" stopColor="#251713" />
              <stop offset="100%" stopColor="#150c09" />
            </radialGradient>

            <radialGradient id="soilDryGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5c4033" />
              <stop offset="70%" stopColor="#453026" />
              <stop offset="100%" stopColor="#271811" />
            </radialGradient>

            <radialGradient id="soilWetGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Shadows */}
            <filter id="subtleLeafShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.8" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
            <filter id="fruitSubtleGlow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#991b1b" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* 1. Bamboo Trellis Stake Support */}
          <g id="bamboo-stake">
            <path
              d="M 197 284 L 202 54"
              fill="none"
              stroke="url(#bambooStakeGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Bamboo Node Rings */}
            <ellipse cx="198" cy="235" rx="3.5" ry="1.2" fill="#451a03" />
            <ellipse cx="199" cy="180" rx="3.5" ry="1.2" fill="#451a03" />
            <ellipse cx="200" cy="125" rx="3.5" ry="1.2" fill="#451a03" />
            <ellipse cx="201" cy="75" rx="3.2" ry="1" fill="#451a03" />

            {/* Natural Garden Twine Ties */}
            <path d="M 194 233 Q 199 237 205 233" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 196 178 Q 200 182 206 178" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 197 123 Q 201 127 207 123" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* 2. Plant Pot & Soil Base */}
          <PlantPot soilMoisture={m} watering={watering} />

          {/* 3. Lush Bushy Tomato Canopy */}
          <g id="tomato-specimen-canopy">

            {/* Main Climbing Vine (Organic S-Curve) */}
            <path
              d="M 196 284 Q 188 220 204 150 Q 208 95 201 58"
              fill="none"
              stroke="url(#stemGradient)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Vine Specular Highlight */}
            <path
              d="M 195 280 Q 189 220 203 150 Q 207 95 200 62"
              fill="none"
              stroke="rgba(255, 255, 255, 0.32)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* LAYER 1: Deep Lower Branches (Lush & Wide) */}
            <TomatoCompoundBranch
              originX={192}
              originY={250}
              length={92}
              angle={22}
              droopAngle={droopFactor * 1.15}
              flip={true}
              swayDuration={5.2}
              swayDelay={0.2}
              leafColorGrad={leafColorGrad}
            />
            <TomatoCompoundBranch
              originX={198}
              originY={240}
              length={90}
              angle={20}
              droopAngle={droopFactor * 1.1}
              flip={false}
              swayDuration={5.5}
              swayDelay={0.7}
              leafColorGrad={leafColorGrad}
            />

            {/* LAYER 2: Lower-Mid Fill Leaflets (Eliminates Empty Triangular Gap) */}
            <TomatoCompoundBranch
              originX={190}
              originY={215}
              length={76}
              angle={35}
              droopAngle={droopFactor * 0.9}
              flip={true}
              swayDuration={4.9}
              swayDelay={0.5}
              leafColorGrad={leafColorGrad}
            />
            <TomatoCompoundBranch
              originX={200}
              originY={205}
              length={78}
              angle={32}
              droopAngle={droopFactor * 0.85}
              flip={false}
              swayDuration={5.1}
              swayDelay={0.3}
              leafColorGrad={leafColorGrad}
            />

            {/* LAYER 3: Mid Canopy Branches */}
            <TomatoCompoundBranch
              originX={195}
              originY={170}
              length={82}
              angle={24}
              droopAngle={droopFactor * 0.8}
              flip={true}
              swayDuration={4.6}
              swayDelay={0.4}
              leafColorGrad={leafColorGrad}
            />
            <TomatoCompoundBranch
              originX={203}
              originY={155}
              length={80}
              angle={22}
              droopAngle={droopFactor * 0.75}
              flip={false}
              swayDuration={4.8}
              swayDelay={0.9}
              leafColorGrad={leafColorGrad}
            />

            {/* LAYER 4: Upper Canopy Branches */}
            <TomatoCompoundBranch
              originX={200}
              originY={120}
              length={68}
              angle={28}
              droopAngle={droopFactor * 0.6}
              flip={true}
              swayDuration={4.3}
              swayDelay={0.3}
              leafColorGrad={leafColorGrad}
            />
            <TomatoCompoundBranch
              originX={204}
              originY={105}
              length={66}
              angle={26}
              droopAngle={droopFactor * 0.55}
              flip={false}
              swayDuration={4.5}
              swayDelay={0.8}
              leafColorGrad={leafColorGrad}
            />

            {/* LAYER 5: Apex Tender Shoot Crown */}
            <g transform="translate(201, 58)">
              <g transform="rotate(-40) scale(0.65)">
                <LeafletBlade length={34} width={15} fill={leafColorGrad} />
              </g>
              <g transform="rotate(40) scale(0.65)">
                <LeafletBlade length={34} width={15} fill={leafColorGrad} />
              </g>
              <g transform="rotate(-90) scale(0.6)">
                <LeafletBlade length={30} width={13} fill={leafColorGrad} />
              </g>
            </g>

            {/* 4. Tomato Fruit Trusses (Natural Clusters Hanging on Stalks) */}

            {/* Truss A: Ruby Ripe Crimson Tomatoes (Lower Left-Center) */}
            <g transform="translate(186, 222)">
              <path d="M 0 0 Q -12 8 -18 26 T -24 48" fill="none" stroke="#2d6a4f" strokeWidth="2.6" strokeLinecap="round" />
              <TomatoFruit cx={-12} cy={28} r={18} stage="ripe" hangAngle={-5} swayDelay={0.2} />
              <TomatoFruit cx={-26} cy={50} r={14.5} stage="ripe" hangAngle={4} swayDelay={0.5} />
              <TomatoFruit cx={0} cy={38} r={12} stage="ripe" hangAngle={2} swayDelay={0.7} />
            </g>

            {/* Truss B: Sunset Orange Turning & Green Cherry Tomatoes (Mid Right) */}
            <g transform="translate(206, 162)">
              <path d="M 0 0 Q 14 6 22 22 T 28 42" fill="none" stroke="#2d6a4f" strokeWidth="2.4" strokeLinecap="round" />
              <TomatoFruit cx={16} cy={22} r={14} stage="turning" hangAngle={-3} swayDelay={0.3} />
              <TomatoFruit cx={28} cy={42} r={11.5} stage="green" hangAngle={5} swayDelay={0.6} />
            </g>

            {/* Truss C: Developing Baby Green Tomatoes (Upper Mid Left) */}
            <g transform="translate(196, 126)">
              <path d="M 0 0 Q -10 6 -16 18" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
              <TomatoFruit cx={-16} cy={20} r={9.5} stage="green" hangAngle={-2} swayDelay={0.8} />
            </g>

            {/* 5. Golden Star Tomato Blossoms */}
            <TomatoBlossomCluster originX={198} originY={92} flip={false} swayDelay={0.3} />
            <TomatoBlossomCluster originX={202} originY={76} flip={true} swayDelay={0.6} />
          </g>
        </svg>

        {/* 4. Perfectly Positioned Hotspots */}
        <div className="hotspots-overlay">
          {/* Soil Moisture Pin (Over Soil Probe) */}
          <SensorHotspot
            id="moisture"
            type="moisture"
            top="66%"
            left="35%"
            title={labels?.soilMoisture || 'Soil Moisture'}
            isActive={activeHotspot === 'moisture'}
            onToggle={toggleHotspot}
          />

          {/* Temperature Pin (Over Mid Canopy Foliage) */}
          <SensorHotspot
            id="temperature"
            type="temperature"
            top="40%"
            left="64%"
            title={labels?.temperature || 'Canopy Temperature'}
            isActive={activeHotspot === 'temperature'}
            onToggle={toggleHotspot}
          />

          {/* Sunlight Pin (Over Flowering Apex) */}
          <SensorHotspot
            id="light"
            type="light"
            top="12%"
            left="50%"
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
              sensors={sensors}
              labels={labels}
              onClose={closeHotspot}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 6. Footer Quick Telemetry Chips */}
      <div className="plant-svg-footer" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`footer-stat-chip ${activeHotspot === 'moisture' ? 'active-chip' : ''}`}
          onClick={() => toggleHotspot('moisture')}
        >
          <Droplets size={14} className="text-sky-500" />
          <span>Moisture: <strong>{m !== undefined ? `${m.toFixed(1)}%` : '--'}</strong></span>
        </button>

        <button
          type="button"
          className={`footer-stat-chip ${activeHotspot === 'temperature' ? 'active-chip' : ''}`}
          onClick={() => toggleHotspot('temperature')}
        >
          <Thermometer size={14} className="text-orange-500" />
          <span>Temp: <strong>{t !== undefined ? `${t.toFixed(1)}°C` : '--'}</strong></span>
        </button>

        <button
          type="button"
          className={`footer-stat-chip ${activeHotspot === 'light' ? 'active-chip' : ''}`}
          onClick={() => toggleHotspot('light')}
        >
          <Sun size={14} className="text-amber-500" />
          <span>Light: <strong>{lux !== undefined ? `${Math.round(lux)} lux` : '--'}</strong></span>
        </button>
      </div>
    </div>
  );
};

export default TomatoPlantSVG;

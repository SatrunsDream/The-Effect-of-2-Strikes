import { motion } from 'framer-motion';
import { ORANGE, RED } from '../../theme';

interface Props {
  attackAngle: number;
  swingPathTilt: number;
  attackDirection: number;
  batSpeed: number;
}

export function SwingDiagram({ attackAngle, swingPathTilt, attackDirection, batSpeed }: Props) {
  // Map metrics to visual angles
  const CX = 160, CY = 140;
  const R = 110;

  // Attack angle: upward angle of the swing, mapped 0-60° → displayed as angle above horizontal
  const attackRad = (Math.min(Math.max(attackAngle, 0), 60) * Math.PI) / 180;
  const batEndX = CX - R * Math.cos(attackRad);
  const batEndY = CY + R * Math.sin(attackRad);

  // Tilt arc: swing path tilt shown as a subtle arc
  const tiltRad = (Math.min(Math.max(swingPathTilt, 0), 60) * Math.PI) / 180;
  const tiltEndX = CX - R * 0.7 * Math.cos(tiltRad + 0.3);
  const tiltEndY = CY + R * 0.7 * Math.sin(tiltRad + 0.3);

  // Speed indicator: thickness of bat line proportional to speed
  const strokeW = 2 + (batSpeed / 120) * 6;

  // Contact point circle
  const speedPct = Math.min(batSpeed / 120, 1);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg viewBox="0 0 320 280" className="w-full" style={{ maxHeight: '280px' }}>
        {/* Background field arc */}
        <defs>
          <radialGradient id="field-grad" cx="50%" cy="80%" r="80%">
            <stop offset="0%" stopColor="#1a3a1a" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={CX} cy={CY + 60} rx={R * 1.6} ry={30} fill="url(#field-grad)" />

        {/* Horizontal reference line */}
        <line x1={CX - R * 1.2} y1={CY} x2={CX + R * 0.3} y2={CY}
          stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="6,4" />

        {/* Swing path tilt (secondary, muted) */}
        <motion.line
          x1={CX} y1={CY} x2={tiltEndX} y2={tiltEndY}
          stroke={ORANGE} strokeWidth={strokeW * 0.6} strokeOpacity={0.35}
          strokeLinecap="round"
          animate={{ x2: tiltEndX, y2: tiltEndY }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Attack angle bat path (primary, bold) */}
        <motion.line
          x1={CX} y1={CY} x2={batEndX} y2={batEndY}
          stroke={RED} strokeWidth={strokeW} strokeLinecap="round"
          animate={{ x2: batEndX, y2: batEndY }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Fill polygon between baseline and bat path */}
        <motion.polygon
          fill={ORANGE} fillOpacity={0.18}
          animate={{
            points: `${CX},${CY} ${CX - R * 1.2},${CY} ${batEndX},${batEndY}`
          }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />

        {/* Contact point (ball) — solid white reads on dark panels */}
        <motion.circle
          cx={CX} cy={CY} r={16}
          fill="rgba(0,0,0,0.2)"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx={CX} cy={CY} r={14}
          fill="#ffffff"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={1.25}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx={CX} cy={CY} r={6} fill="#e8e8e8" />

        {/* Speed ring */}
        <motion.circle cx={CX} cy={CY} r={18} fill="none" stroke={ORANGE}
          strokeWidth={2} strokeOpacity={0.5}
          pathLength={100}
          strokeDasharray={100}
          animate={{ strokeDashoffset: 100 - speedPct * 100 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ rotate: '-90deg', transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Direction arrow */}
        <motion.line
          x1={CX} y1={CY - 22}
          animate={{
            x2: CX + Math.sin((attackDirection * Math.PI) / 180) * 40,
            y2: CY - 22 - Math.cos((attackDirection * Math.PI) / 180) * 40,
          }}
          x2={CX} y2={CY - 62}
          stroke={ORANGE} strokeWidth={2} strokeLinecap="round"
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />

        {/* Labels */}
        <text x={20} y={CY - 12} fill={RED} fontSize={11} fontWeight={700}>Attack Angle</text>
        <text x={20} y={CY + 4} fill="rgba(255,255,255,0.3)" fontSize={10}>{attackAngle.toFixed(1)}°</text>

        <text x={220} y={CY - 12} fill={ORANGE} fontSize={11} fontWeight={700} textAnchor="middle">Tilt</text>
        <text x={220} y={CY + 4} fill="rgba(255,255,255,0.3)" fontSize={10} textAnchor="middle">{swingPathTilt.toFixed(1)}°</text>

        <text x={CX} y={280} fill="rgba(255,255,255,0.4)" fontSize={11} textAnchor="middle">
          Bat Speed: <tspan fill={ORANGE} fontWeight={700}>{batSpeed.toFixed(1)} mph</tspan>
        </text>
      </svg>

      {/* Metric pills */}
      <div className="flex gap-3 flex-wrap justify-center">
        {[
          { label: 'Attack', value: `${attackAngle.toFixed(1)}°`, color: RED },
          { label: 'Tilt', value: `${swingPathTilt.toFixed(1)}°`, color: ORANGE },
          { label: 'Direction', value: `${attackDirection.toFixed(1)}°`, color: '#60a5fa' },
          { label: 'Speed', value: `${batSpeed.toFixed(1)} mph`, color: '#34d399' },
        ].map(pill => (
          <div key={pill.label} className="flex flex-col items-center rounded-lg px-3 py-1.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${pill.color}40` }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{pill.label}</span>
            <span className="text-sm font-black" style={{ color: pill.color }}>{pill.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

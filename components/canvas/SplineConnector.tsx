'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RenderSpline } from '../../core/engine/PathTopology';

interface SplineConnectorProps {
  spline: RenderSpline;
  color?: string;
}

export const SplineConnector: React.FC<SplineConnectorProps> = ({ spline, color }) => {
  const strokeColor = color || (spline.isMerge ? 'var(--branch-feat)' : 'var(--branch-main)');

  return (
    <g>
      {/* Background shadow path for depth */}
      <path
        d={spline.pathD}
        fill="none"
        stroke="rgba(0, 0, 0, 0.4)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Animated fluid SVG Bézier curve */}
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        d={spline.pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={spline.isMerge ? '6,4' : undefined}
      />
    </g>
  );
};

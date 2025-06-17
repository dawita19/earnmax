import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

interface AnimatedMetricProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

const NumberContainer = styled(motion.span)`
  display: inline-block;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`;

export const AnimatedMetric = ({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
}: AnimatedMetricProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(value);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    prevValue.current = end;

    if (start === end) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      const currentValue = start + (end - start) * progress;
      setDisplayValue(parseFloat(currentValue.toFixed(decimalPlaces)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, decimalPlaces]);

  return (
    <NumberContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </NumberContainer>
  );
};
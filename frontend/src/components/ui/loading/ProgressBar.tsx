import React from 'react';
import styled, { keyframes } from 'styled-components';

const progress = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

interface ProgressBarProps {
  value?: number;
  indeterminate?: boolean;
  color?: string;
  height?: string;
  borderRadius?: string;
  withLabel?: boolean;
}

const ProgressContainer = styled.div<{ height?: string }>`
  width: 100%;
  height: ${(props) => props.height || '6px'};
  background-color: #f0f0f0;
  border-radius: ${(props) => props.borderRadius || '3px'};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<ProgressBarProps>`
  height: 100%;
  width: ${(props) => (props.indeterminate ? '100%' : `${props.value}%`)};
  background: ${(props) => 
    props.indeterminate 
      ? `linear-gradient(90deg, #4a6cf7, #6a8df8, #4a6cf7)`
      : props.color || '#4a6cf7'};
  background-size: ${(props) => (props.indeterminate ? '200% 100%' : 'auto')};
  animation: ${(props) => (props.indeterminate ? progress : 'none')} 2s linear infinite;
  transition: width 0.3s ease-out;
  border-radius: inherit;
`;

const ProgressLabel = styled.span`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  indeterminate = false,
  color,
  height,
  borderRadius,
  withLabel = false,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <ProgressContainer height={height} borderRadius={borderRadius}>
      <ProgressFill 
        value={clampedValue} 
        indeterminate={indeterminate}
        color={color}
      />
      {withLabel && !indeterminate && (
        <ProgressLabel>{clampedValue}%</ProgressLabel>
      )}
    </ProgressContainer>
  );
};

// Variants
ProgressBar.Circular = ({ size = 40, strokeWidth = 4, value = 0, color = '#4a6cf7' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: size * 0.25,
        fontWeight: 'bold',
        color: '#333',
      }}>
        {value}%
      </div>
    </div>
  );
};
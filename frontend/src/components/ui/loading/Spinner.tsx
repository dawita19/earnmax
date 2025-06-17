import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

interface SpinnerProps {
  size?: string;
  color?: string;
  thickness?: string;
  speed?: string;
  variant?: 'default' | 'dots' | 'pulse';
}

const SpinnerBase = styled.div<SpinnerProps>`
  display: inline-block;
  width: ${(props) => props.size || '1.5rem'};
  height: ${(props) => props.size || '1.5rem'};
  border: ${(props) => props.thickness || '3px'} solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${(props) => props.color || '#4a6cf7'};
  animation: ${spin} ${(props) => props.speed || '0.8s'} linear infinite;
`;

const DotsContainer = styled.div<{ size?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: ${(props) => props.size || '2.5rem'};
  height: ${(props) => props.size || '1rem'};
`;

const Dot = styled.div<{ color?: string; delay?: string }>`
  width: 25%;
  height: 100%;
  background-color: ${(props) => props.color || '#4a6cf7'};
  border-radius: 50%;
  animation: ${pulse} 1.4s ease-in-out ${(props) => props.delay || '0s'} infinite both;
`;

const PulseSpinner = styled.div<{ size?: string; color?: string }>`
  width: ${(props) => props.size || '1.5rem'};
  height: ${(props) => props.size || '1.5rem'};
  background-color: ${(props) => props.color || '#4a6cf7'};
  border-radius: 50%;
  animation: ${pulse} 0.8s ease-in-out infinite;
`;

export const Spinner: React.FC<SpinnerProps> = ({
  size,
  color,
  thickness,
  speed,
  variant = 'default',
}) => {
  if (variant === 'dots') {
    return (
      <DotsContainer size={size}>
        <Dot color={color} delay="0s" />
        <Dot color={color} delay="0.2s" />
        <Dot color={color} delay="0.4s" />
      </DotsContainer>
    );
  }

  if (variant === 'pulse') {
    return <PulseSpinner size={size} color={color} />;
  }

  return (
    <SpinnerBase
      size={size}
      color={color}
      thickness={thickness}
      speed={speed}
    />
  );
};

// Full page spinner overlay
Spinner.FullPage = ({ text = 'Loading...' }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  }}>
    <Spinner size="3rem" thickness="4px" />
    {text && (
      <p style={{
        marginTop: '1rem',
        color: '#555',
        fontSize: '1rem',
      }}>
        {text}
      </p>
    )}
  </div>
);

// Button spinner variant
Spinner.Button = () => (
  <Spinner size="1rem" thickness="2px" color="currentColor" />
);
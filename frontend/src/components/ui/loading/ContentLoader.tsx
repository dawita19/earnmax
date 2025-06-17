import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

interface ContentLoaderProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  margin?: string;
  children?: React.ReactNode;
}

const SkeletonBase = styled.div<ContentLoaderProps>`
  animation: ${pulse} 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '1rem'};
  border-radius: ${(props) => props.borderRadius || '4px'};
  margin: ${(props) => props.margin || '0'};
`;

export const ContentLoader: React.FC<ContentLoaderProps> = ({
  width,
  height,
  borderRadius,
  margin,
  children,
}) => {
  if (children) {
    return (
      <div style={{ position: 'relative' }}>
        {children}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <SkeletonBase 
            width="100%" 
            height="100%" 
            borderRadius={borderRadius}
          />
        </div>
      </div>
    );
  }
  
  return (
    <SkeletonBase 
      width={width} 
      height={height} 
      borderRadius={borderRadius}
      margin={margin}
    />
  );
};

// Compound components for specific use cases
ContentLoader.Card = () => (
  <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
    <ContentLoader width="60%" height="20px" margin="0 0 1rem 0" />
    <ContentLoader width="100%" height="15px" margin="0 0 0.5rem 0" />
    <ContentLoader width="100%" height="15px" margin="0 0 0.5rem 0" />
    <ContentLoader width="40%" height="15px" />
  </div>
);

ContentLoader.ListItem = () => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0' }}>
    <ContentLoader width="40px" height="40px" borderRadius="50%" margin="0 1rem 0 0" />
    <div style={{ flex: 1 }}>
      <ContentLoader width="70%" height="16px" margin="0 0 0.5rem 0" />
      <ContentLoader width="50%" height="12px" />
    </div>
  </div>
);
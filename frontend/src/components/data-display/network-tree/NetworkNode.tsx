import React from 'react';
import { UserNode } from '../../../types';

interface NetworkNodeProps {
  user: UserNode;
  size: number;
  isRoot: boolean;
}

const NetworkNode: React.FC<NetworkNodeProps> = ({ user, size, isRoot }) => {
  const nodeRadius = size / 2;
  const fontSize = Math.max(10, size / 3);
  
  return (
    <g className="network-node">
      {/* Background circle */}
      <circle
        r={nodeRadius}
        fill={isRoot ? '#4f46e5' : getLevelColor(user.level)}
        stroke="#fff"
        strokeWidth={2}
      />
      
      {/* Initials/text */}
      <text
        dy=".35em"
        fontSize={fontSize}
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        pointerEvents="none"
      >
        {getUserInitials(user.name)}
      </text>
      
      {/* VIP level badge */}
      <circle
        r={nodeRadius / 3}
        cx={nodeRadius * 0.7}
        cy={-nodeRadius * 0.7}
        fill="#f59e0b"
        stroke="#fff"
        strokeWidth={1}
      />
      <text
        x={nodeRadius * 0.7}
        y={-nodeRadius * 0.7}
        dy=".35em"
        fontSize={fontSize * 0.7}
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        pointerEvents="none"
      >
        {user.vipLevel}
      </text>
      
      {/* Earnings indicator */}
      {user.totalEarnings > 0 && (
        <circle
          r={nodeRadius / 4}
          cx={-nodeRadius * 0.7}
          cy={-nodeRadius * 0.7}
          fill="#10b981"
          stroke="#fff"
          strokeWidth={1}
        />
      )}
    </g>
  );
};

// Helper functions
function getUserInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase();
}

function getLevelColor(level: number): string {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];
  return colors[level % colors.length];
}

export default NetworkNode;
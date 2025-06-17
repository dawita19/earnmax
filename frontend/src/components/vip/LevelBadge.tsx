import React from 'react';
import { Badge, Tooltip } from 'antd';
import { CrownOutlined, StarOutlined } from '@ant-design/icons';
import { VIP_LEVELS } from '../../constants/vipLevels';

interface LevelBadgeProps {
  level: number;
  size?: 'default' | 'small' | 'large';
  showText?: boolean;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'default', showText = true }) => {
  const getBadgeColor = () => {
    const colors = ['#a5a5a5', '#ffd700', '#c0c0c0', '#cd7f32', '#e5e4e2', '#b9f2ff', '#ffa500', '#a7f3d0', '#6366f1'];
    return colors[level] || '#000000';
  };

  const getIcon = () => {
    if (level >= 7) return <CrownOutlined />;
    if (level >= 4) return <StarOutlined />;
    return null;
  };

  const sizeMap = {
    small: 18,
    default: 24,
    large: 32
  };

  return (
    <Tooltip title={`VIP ${level} - ${VIP_LEVELS[level]?.name || 'Free Tier'}`}>
      <Badge
        count={
          <div
            style={{
              backgroundColor: getBadgeColor(),
              borderRadius: '50%',
              width: sizeMap[size],
              height: sizeMap[size],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: level === 0 ? '#000' : '#fff',
              fontWeight: 'bold',
              fontSize: size === 'large' ? '16px' : '12px'
            }}
          >
            {getIcon() || level}
          </div>
        }
      >
        {showText && (
          <span style={{ marginLeft: 8, fontWeight: 500 }}>
            VIP {level}
          </span>
        )}
      </Badge>
    </Tooltip>
  );
};

export default LevelBadge;
import React from 'react';
import { Progress, Tooltip, Row, Col, Typography } from 'antd';
import { VIP_LEVELS } from '../../constants/vipLevels';

const { Text } = Typography;

interface LevelProgressProps {
  currentLevel: number;
  currentInvestment: number;
  nextLevel?: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ 
  currentLevel, 
  currentInvestment,
  nextLevel 
}) => {
  const targetLevel = nextLevel || currentLevel + 1;
  
  if (currentLevel >= 8 || !VIP_LEVELS[targetLevel]) {
    return (
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <Text strong>You've reached the highest VIP level!</Text>
      </div>
    );
  }

  const currentLevelData = VIP_LEVELS[currentLevel];
  const targetLevelData = VIP_LEVELS[targetLevel];
  
  const progress = Math.min(
    100,
    ((currentInvestment - currentLevelData.investment) / 
     (targetLevelData.investment - currentLevelData.investment)) * 100
  );

  const requiredAmount = targetLevelData.investment - currentInvestment;

  return (
    <div style={{ margin: '16px 0' }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Col>
          <Text strong>VIP {currentLevel}</Text>
        </Col>
        <Col>
          <Text strong>VIP {targetLevel}</Text>
        </Col>
      </Row>
      
      <Tooltip 
        title={`${currentInvestment.toLocaleString()} / ${targetLevelData.investment.toLocaleString()} ETB`}
      >
        <Progress 
          percent={progress} 
          status="active" 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      </Tooltip>
      
      <Row justify="center" style={{ marginTop: 8 }}>
        <Text type="secondary">
          {requiredAmount > 0 ? (
            `Invest ${requiredAmount.toLocaleString()} ETB more to reach VIP ${targetLevel}`
          ) : (
            "You qualify for an upgrade!"
          )}
        </Text>
      </Row>
    </div>
  );
};

export default LevelProgress;
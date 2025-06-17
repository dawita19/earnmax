import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Typography, Steps, Form, InputNumber, Alert } from 'antd';
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import LevelBadge from './LevelBadge';
import LevelProgress from './LevelProgress';
import { VIP_LEVELS } from '../../constants/vipLevels';

const { Title, Text } = Typography;
const { Step } = Steps;

interface UpgradeModalProps {
  visible: boolean;
  onCancel: () => void;
  onComplete: (level: number, rechargeAmount: number, proof?: string) => void;
  currentLevel: number;
  currentInvestment: number;
  userBalance: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  visible, 
  onCancel, 
  onComplete,
  currentLevel,
  currentInvestment,
  userBalance
}) => {
  const [form] = Form.useForm();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [upgradeAmount, setUpgradeAmount] = useState(0);
  const [rechargeNeeded, setRechargeNeeded] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'external'>('balance');

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setSelectedLevel(null);
      form.resetFields();
    }
  }, [visible, form]);

  const calculateUpgrade = (targetLevel: number) => {
    const currentData = VIP_LEVELS[currentLevel];
    const targetData = VIP_LEVELS[targetLevel];
    
    const amountDifference = targetData.investment - currentData.investment;
    const rechargeAmount = Math.max(0, amountDifference - userBalance);
    
    return {
      upgradeAmount: amountDifference,
      rechargeNeeded: rechargeAmount,
      canUpgrade: userBalance >= amountDifference
    };
  };

  const handleLevelSelect = (level: number) => {
    const { upgradeAmount, rechargeNeeded, canUpgrade } = calculateUpgrade(level);
    
    setSelectedLevel(level);
    setUpgradeAmount(upgradeAmount);
    setRechargeNeeded(rechargeNeeded);
    setPaymentMethod(canUpgrade ? 'balance' : 'external');
    
    form.setFieldsValue({
      level,
      upgradeAmount,
      rechargeAmount: rechargeNeeded
    });
    
    setCurrentStep(1);
  };

  const handleFinish = (values: any) => {
    if (paymentMethod === 'balance') {
      onComplete(values.level, 0);
    } else {
      setCurrentStep(2);
    }
  };

  return (
    <Modal
      title="Upgrade VIP Level"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Select Level" />
        <Step title="Upgrade Details" />
        <Step title="Payment" />
      </Steps>

      {currentStep === 0 && (
        <div>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
            Available VIP Upgrades
          </Title>
          
          <LevelProgress 
            currentLevel={currentLevel} 
            currentInvestment={currentInvestment}
          />
          
          <Row gutter={[16, 16]}>
            {Object.entries(VIP_LEVELS)
              .filter(([level]) => parseInt(level) > currentLevel)
              .map(([level, data]) => {
                const levelNum = parseInt(level);
                const { canUpgrade } = calculateUpgrade(levelNum);

                return (
                  <Col xs={24} sm={12} key={level}>
                    <Card
                      hoverable
                      onClick={() => handleLevelSelect(levelNum)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <LevelBadge level={levelNum} size="large" />
                        <Title level={4} style={{ margin: '8px 0' }}>
                          {data.name}
                        </Title>
                        <Text strong style={{ fontSize: 18 }}>
                          {data.investment.toLocaleString()} ETB
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Text type={canUpgrade ? 'success' : 'warning'}>
                            {canUpgrade ? 
                              'Sufficient balance for upgrade' : 
                              'Additional recharge required'}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
          </Row>
        </div>
      )}

      {currentStep === 1 && selectedLevel && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
            Upgrade to VIP {selectedLevel}
          </Title>
          
          <Form.Item label="Current VIP Level">
            <LevelBadge level={currentLevel} showText />
          </Form.Item>
          
          <Form.Item label="Target VIP Level">
            <LevelBadge level={selectedLevel} showText />
          </Form.Item>
          
          <Form.Item label="Upgrade Amount">
            <InputNumber 
              value={upgradeAmount} 
              disabled 
              style={{ width: '100%' }}
              formatter={value => `${value} ETB`}
            />
          </Form.Item>
          
          <Form.Item label="Your Balance">
            <InputNumber 
              value={userBalance} 
              disabled 
              style={{ width: '100%' }}
              formatter={value => `${value} ETB`}
            />
          </Form.Item>
          
          {rechargeNeeded > 0 && (
            <Form.Item label="Additional Recharge Required">
              <InputNumber 
                value={rechargeNeeded} 
                disabled 
                style={{ width: '100%' }}
                formatter={value => `${value} ETB`}
              />
              <Alert 
                message="You need to recharge to complete this upgrade" 
                type="warning" 
                showIcon
                style={{ marginTop: 8 }}
              />
            </Form.Item>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={paymentMethod === 'external' ? <LoadingOutlined /> : null}
            >
              {paymentMethod === 'balance' ? 
                'Confirm Upgrade' : 
                'Proceed to Payment'}
            </Button>
          </div>
        </Form>
      )}

      {currentStep === 2 && (
        <div style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4}>Upgrade Request Submitted</Title>
          <Text style={{ display: 'block', marginBottom: 24 }}>
            Your VIP upgrade request has been received. After payment verification, 
            your account will be upgraded within 48 hours.
          </Text>
          <Button type="primary" onClick={() => onComplete(selectedLevel!, rechargeNeeded)}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default UpgradeModal;
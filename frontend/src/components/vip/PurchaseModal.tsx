import React, { useState } from 'react';
import { Modal, Button, Card, Row, Col, Typography, Steps, Upload, message } from 'antd';
import { InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import LevelBadge from './LevelBadge';
import { VIP_LEVELS } from '../../constants/vipLevels';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

interface PurchaseModalProps {
  visible: boolean;
  onCancel: () => void;
  onComplete: (level: number, proof: string) => void;
  currentLevel: number;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ 
  visible, 
  onCancel, 
  onComplete,
  currentLevel
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleLevelSelect = (level: number) => {
    if (level <= currentLevel) return;
    setSelectedLevel(level);
    setCurrentStep(1);
  };

  const handleProofUpload = (info: any) => {
    const { status, response } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      setPaymentProof(response.url);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleComplete = () => {
    if (!selectedLevel || !paymentProof) return;
    onComplete(selectedLevel, paymentProof);
    setCurrentStep(0);
    setSelectedLevel(null);
    setPaymentProof(null);
  };

  return (
    <Modal
      title="Upgrade VIP Level"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Select Level" />
        <Step title="Payment Proof" />
        <Step title="Confirmation" />
      </Steps>

      {currentStep === 0 && (
        <div>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
            Select VIP Level to Purchase
          </Title>
          <Row gutter={[16, 16]}>
            {Object.entries(VIP_LEVELS).map(([level, data]) => {
              const levelNum = parseInt(level);
              const isCurrent = levelNum === currentLevel;
              const isDisabled = levelNum <= currentLevel;

              return (
                <Col xs={24} sm={12} md={8} key={level}>
                  <Card
                    hoverable={!isDisabled}
                    onClick={() => !isDisabled && handleLevelSelect(levelNum)}
                    style={{
                      borderColor: isCurrent ? '#1890ff' : '#d9d9d9',
                      opacity: isDisabled ? 0.6 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer'
                    }}
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
                        <Text type="secondary">
                          Daily: {data.dailyEarning.toLocaleString()} ETB
                        </Text>
                      </div>
                      {isCurrent && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="success">
                            <CheckCircleOutlined /> Current Level
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {currentStep === 1 && selectedLevel && (
        <div>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
            Upload Payment Proof for VIP {selectedLevel}
          </Title>
          <Text style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
            Please transfer {VIP_LEVELS[selectedLevel].investment.toLocaleString()} ETB to our account 
            and upload the payment receipt.
          </Text>
          
          <Dragger
            name="payment_proof"
            multiple={false}
            action="/api/upload/payment-proof"
            onChange={handleProofUpload}
            showUploadList={true}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single upload (PNG, JPG, PDF)
            </p>
          </Dragger>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(2)}
              disabled={!paymentProof}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && selectedLevel && paymentProof && (
        <div style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4}>Purchase Request Submitted</Title>
          <Text style={{ display: 'block', marginBottom: 24 }}>
            Your request to upgrade to VIP {selectedLevel} has been received. 
            Our team will verify your payment and process your upgrade within 48 hours.
          </Text>
          <Button type="primary" onClick={handleComplete}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default PurchaseModal;
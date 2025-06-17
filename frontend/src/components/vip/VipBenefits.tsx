import React from 'react';
import { Table, Typography, Card, Row, Col } from 'antd';
import LevelBadge from './LevelBadge';
import { VIP_LEVELS } from '../../constants/vipLevels';

const { Title, Text } = Typography;

const VipBenefits: React.FC = () => {
  const columns = [
    {
      title: 'VIP Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => <LevelBadge level={level} />,
      width: 100,
    },
    {
      title: 'Investment',
      dataIndex: 'investment',
      key: 'investment',
      render: (amount: number) => `${amount.toLocaleString()} ETB`,
      sorter: (a: any, b: any) => a.investment - b.investment,
    },
    {
      title: 'Daily Earning',
      dataIndex: 'dailyEarning',
      key: 'dailyEarning',
      render: (amount: number) => `${amount.toLocaleString()} ETB`,
      sorter: (a: any, b: any) => a.dailyEarning - b.dailyEarning,
    },
    {
      title: 'Per Task',
      dataIndex: 'perTaskEarning',
      key: 'perTaskEarning',
      render: (amount: number) => `${amount.toLocaleString()} ETB`,
      sorter: (a: any, b: any) => a.perTaskEarning - b.perTaskEarning,
    },
    {
      title: 'Min Withdrawal',
      dataIndex: 'minWithdrawal',
      key: 'minWithdrawal',
      render: (amount: number) => `${amount.toLocaleString()} ETB`,
      sorter: (a: any, b: any) => a.minWithdrawal - b.minWithdrawal,
    },
    {
      title: 'Max Withdrawal',
      dataIndex: 'maxWithdrawal',
      key: 'maxWithdrawal',
      render: (amount: number) => `${amount.toLocaleString()} ETB`,
      sorter: (a: any, b: any) => a.maxWithdrawal - b.maxWithdrawal,
    },
  ];

  const expandedRowRender = (record: any) => {
    return (
      <div style={{ margin: 0 }}>
        <Title level={5} style={{ marginBottom: 8 }}>Daily Tasks:</Title>
        <Row gutter={[16, 8]}>
          {record.dailyTasks.map((task: string, index: number) => (
            <Col span={12} key={index}>
              <Card size="small">
                <Text>{task}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        VIP Levels Benefits Comparison
      </Title>
      
      <Table
        columns={columns}
        dataSource={Object.values(VIP_LEVELS).map((level, index) => ({
          key: index,
          level: index,
          ...level
        }))}
        expandable={{ expandedRowRender }}
        bordered
        pagination={false}
        scroll={{ x: true }}
      />
      
      <div style={{ marginTop: 24 }}>
        <Title level={4}>Referral Bonus Structure</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card title="1st Level" bordered={false}>
              <Text strong style={{ fontSize: 24 }}>20%</Text>
              <Text type="secondary" style={{ display: 'block' }}>
                of their purchases and upgrades
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card title="2nd Level" bordered={false}>
              <Text strong style={{ fontSize: 24 }}>10%</Text>
              <Text type="secondary" style={{ display: 'block' }}>
                of their purchases and upgrades
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card title="3rd Level" bordered={false}>
              <Text strong style={{ fontSize: 24 }}>5%</Text>
              <Text type="secondary" style={{ display: 'block' }}>
                of their purchases and upgrades
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card title="4th Level" bordered={false}>
              <Text strong style={{ fontSize: 24 }}>2%</Text>
              <Text type="secondary" style={{ display: 'block' }}>
                of their purchases and upgrades
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default VipBenefits;
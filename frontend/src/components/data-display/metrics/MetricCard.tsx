import styled from 'styled-components';
import { AnimatedMetric } from './AnimatedMetric';
import { TrendIndicator } from './TrendIndicator';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  decimalPlaces?: number;
}

const CardContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
`;

const MainValue = styled.div`
  font-size: 1.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
`;

const ChangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

export const MetricCard = ({
  title,
  value,
  change,
  icon,
  prefix = '',
  suffix = '',
  loading = false,
  decimalPlaces = 0,
}: MetricCardProps) => {
  return (
    <CardContainer>
      <Header>
        <Title>{title}</Title>
        {icon}
      </Header>
      
      <ValueContainer>
        <MainValue>
          {loading ? (
            '--'
          ) : (
            <AnimatedMetric 
              value={value} 
              prefix={prefix} 
              suffix={suffix}
              decimalPlaces={decimalPlaces}
            />
          )}
        </MainValue>
      </ValueContainer>

      {change !== undefined && (
        <ChangeContainer>
          <TrendIndicator value={change} />
          <span style={{ fontSize: '0.875rem' }}>
            {Math.abs(change)}% {change > 0 ? 'increase' : 'decrease'}
          </span>
        </ChangeContainer>
      )}
    </CardContainer>
  );
};
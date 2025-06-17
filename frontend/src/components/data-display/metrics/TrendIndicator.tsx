import styled from 'styled-components';
import { ArrowUp, ArrowDown } from 'react-feather';

interface TrendIndicatorProps {
  value: number;
}

const IndicatorContainer = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $positive, theme }) => 
    $positive ? theme.colors.success : theme.colors.error};
  font-weight: 500;
`;

const ArrowWrapper = styled.div`
  display: flex;
  margin-right: 0.25rem;
`;

export const TrendIndicator = ({ value }: TrendIndicatorProps) => {
  const isPositive = value >= 0;
  const Arrow = isPositive ? ArrowUp : ArrowDown;

  return (
    <IndicatorContainer $positive={isPositive}>
      <ArrowWrapper>
        <Arrow size={14} />
      </ArrowWrapper>
      {Math.abs(value)}%
    </IndicatorContainer>
  );
};
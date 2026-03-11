import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercentage } from '@/utils/formatters';

interface PriceChangeTagProps {
  value: number | null | undefined;
  showArrow?: boolean;
}

export const PriceChangeTag: React.FC<PriceChangeTagProps> = ({ value, showArrow = true }) => {
  if (value == null || value === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {showArrow && <Minus className="h-3 w-3" />} —
      </span>
    );
  }

  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      isPositive ? 'bg-secondary text-ghana-green' : 'bg-destructive/10 text-ghana-danger'
    }`}>
      {showArrow && (isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
      {formatPercentage(value)}
    </span>
  );
};

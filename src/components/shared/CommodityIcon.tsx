import React from 'react';
import { COMMODITY_EMOJIS } from '@/utils/constants';

interface CommodityIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

export const CommodityIcon: React.FC<CommodityIconProps> = ({ name, size = 'md' }) => {
  const emoji = COMMODITY_EMOJIS[name] || '📦';
  return <span className={sizeMap[size]} role="img" aria-label={name}>{emoji}</span>;
};

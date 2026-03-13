import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getMonthlyTrend } from '@/api/analytics';
import { getCurrentOutlook } from '@/api/seasonal';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { PriceChangeTag } from '@/components/shared/PriceChangeTag';
import { PriceTrendChart } from '@/components/charts/PriceTrendChart';
import { formatPrice } from '@/utils/formatters';

interface CommodityCardProps {
  commodity: any;
  priceData: any;
  index: number;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Grains': return 'border-t-green-500';
    case 'Tubers': return 'border-t-orange-500';
    case 'Vegetables': return 'border-t-red-500';
    case 'Fruits': return 'border-t-yellow-500';
    case 'Legumes': return 'border-t-amber-800'; // Brown
    default: return 'border-t-gray-300';
  }
};

export const CommodityCard: React.FC<CommodityCardProps> = ({ commodity, priceData, index }) => {
  const { data: trend } = useQuery({
    queryKey: ['trend', commodity.id || commodity.name, 3],
    queryFn: () => getMonthlyTrend(commodity.id || commodity.name, 3).then(r => r.data?.data || r.data || []),
    staleTime: 5 * 60_000,
  });

  const { data: outlook } = useQuery({
    queryKey: ['outlook', commodity.id || commodity.name],
    queryFn: () => getCurrentOutlook(commodity.id || commodity.name).then(r => r.data?.data || r.data || {}),
    staleTime: 5 * 60_000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`card-ghana flex flex-col h-full bg-card border-t-4 ${getCategoryColor(commodity.category)} hover:-translate-y-1.5 hover:shadow-xl hover:border-black/5 transition-all duration-300 p-8`}
    >
      <div className="flex items-start justify-between">
        <CommodityIcon name={commodity.name} size="lg" />
        <div className="flex items-center gap-2">
          {outlook?.suggestion && (
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              outlook.suggestion === 'BUY' ? 'bg-green-100 text-green-800' :
              outlook.suggestion === 'SELL' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {outlook.suggestion}
            </span>
          )}
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {commodity.category || 'General'}
          </span>
        </div>
      </div>
      <h3 className="mt-3 font-display text-xl font-bold text-foreground">{commodity.name}</h3>
      <p className="text-xs text-muted-foreground">per {commodity.unit || 'kg'}</p>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-mono text-3xl font-extrabold text-primary">
            {formatPrice(priceData?.avgPrice || priceData?.price)}
          </p>
          <PriceChangeTag value={priceData?.percentChange} />
        </div>
      </div>

      <div className="mt-6 flex-1 h-24 w-full opacity-70 pointer-events-none">
        {trend && trend.length > 0 && (
          <PriceTrendChart data={trend} height={90} lines={[{ key: 'avgPrice', name: 'Avg Price', color: '#1B5E20' }]} />
        )}
      </div>

      <Link
        to={`/commodities/${commodity.id || commodity.name}`}
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        View Details →
      </Link>
    </motion.div>
  );
};

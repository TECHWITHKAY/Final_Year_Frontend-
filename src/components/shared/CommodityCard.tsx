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
      className="card-ghana p-6 hover:shadow-md transition-shadow flex flex-col h-full"
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
      
      <div className="mt-3 flex items-end justify-between">
        <p className="font-mono text-2xl font-bold text-primary">
          {formatPrice(priceData?.avgPrice || priceData?.price)}
        </p>
        <PriceChangeTag value={priceData?.percentChange} />
      </div>

      <div className="mt-4 flex-1 h-16 w-full opacity-60 pointer-events-none">
        {trend && trend.length > 0 && (
          <PriceTrendChart data={trend} height={60} />
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

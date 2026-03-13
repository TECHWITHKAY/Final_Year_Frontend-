import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CityComparisonChartProps {
  data: any[];
  height?: number;
}

export const CityComparisonChart: React.FC<CityComparisonChartProps> = ({ data, height = 450 }) => {
  // Sort data to identify top 3 and bottom 3
  const sortedData = [...data].sort((a, b) => b.avgPrice - a.avgPrice);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0EBE0" />
        <XAxis 
          type="number" 
          tick={{ fontSize: 12, fill: '#4A6741' }} 
          label={{ value: 'Price (GHS)', position: 'insideBottom', offset: -15, fill: '#4A6741', fontSize: 12, fontWeight: 500 }} 
        />
        <YAxis 
          dataKey="cityName" 
          type="category" 
          width={90}
          interval={0}
          tick={{ fontSize: 12, fill: '#4A6741' }} 
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #E0EBE0', fontFamily: 'DM Sans' }}
          formatter={(v: number) => [`GHS ${v.toFixed(2)}`, 'Avg Price']}
        />
        <Bar dataKey="avgPrice" animationDuration={1000} radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => {
            const rank = sortedData.findIndex(d => d.cityName === entry.cityName);
            let fill = '#1B5E20'; // Default green
            if (rank < 3 && sortedData.length >= 6) fill = '#C62828'; // Top 3 Red (Expensive)
            if (rank >= sortedData.length - 3 && sortedData.length >= 6) fill = '#43A047'; // Bottom 3 Brighter Green (Cheap)
            return <Cell key={`cell-${index}`} fill={fill} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

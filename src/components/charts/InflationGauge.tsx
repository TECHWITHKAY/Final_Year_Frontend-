import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface InflationGaugeProps {
  value: number;
  label?: string;
}

export const InflationGauge: React.FC<InflationGaugeProps> = ({ value, label = 'Inflation' }) => {
  const color = value > 5 ? '#C62828' : value > 0 ? '#F9A825' : '#1B5E20';
  const data = [{ name: label, value: Math.min(Math.abs(value), 100), fill: color }];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={120} height={120}>
        <RadialBarChart
          cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
          data={data} startAngle={180} endAngle={0}
        >
          <RadialBar dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <p className="font-mono text-lg font-bold" style={{ color }}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}%
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

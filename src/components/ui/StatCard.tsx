import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  loading?: boolean;
  trend?: React.ReactNode;
  animate?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, loading, trend, animate = true }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(animate && typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (!animate || typeof value !== 'number' || !inView) return;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, animate, inView]);

  if (loading) {
    return (
      <div className="card-ghana kente-accent p-5">
        <div className="shimmer h-4 w-24 rounded mb-3" />
        <div className="shimmer h-8 w-16 rounded mb-2" />
        <div className="shimmer h-3 w-32 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="card-ghana kente-accent p-5"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-5 w-5 text-primary" />}
      </div>
      <p className="mt-2 font-mono text-2xl font-bold text-foreground">
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {trend}
      </div>
    </motion.div>
  );
};

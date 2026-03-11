import React from 'react';
import { GRADE_COLORS } from '@/utils/constants';

interface GradeTagProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GradeTag: React.FC<GradeTagProps> = ({ grade, size = 'md' }) => {
  const bg = GRADE_COLORS[grade] || '#666';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-lg' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono font-bold ${sizeClasses}`}
      style={{ backgroundColor: bg, color: '#fff' }}
    >
      {grade}
    </span>
  );
};

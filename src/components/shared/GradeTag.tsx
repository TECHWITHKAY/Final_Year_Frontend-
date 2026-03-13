import React from 'react';
import { GRADE_COLORS } from '@/utils/constants';

interface GradeTagProps {
  grade: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'circle';
  className?: string;
}

export const GradeTag: React.FC<GradeTagProps> = ({ grade, size = 'md', variant = 'badge', className = '' }) => {
  const bg = grade === 'B' ? '#FFD700' : (GRADE_COLORS[grade] || '#666'); // Special gold for B
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-lg',
    xl: 'w-10 h-10 text-xl',
  }[size];

  const variantClasses = variant === 'circle' 
    ? 'rounded-full flex items-center justify-center p-0' 
    : 'rounded-full inline-flex items-center justify-center';

  return (
    <span
      className={`${variantClasses} ${sizeClasses} font-mono font-black shadow-sm ${className}`}
      style={{ backgroundColor: bg, color: grade === 'B' ? '#000' : '#fff' }}
    >
      {grade}
    </span>
  );
};

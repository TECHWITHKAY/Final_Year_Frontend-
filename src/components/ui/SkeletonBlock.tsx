import React from 'react';

interface SkeletonBlockProps {
  className?: string;
  count?: number;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`shimmer rounded ${className}`} />
    ))}
  </>
);

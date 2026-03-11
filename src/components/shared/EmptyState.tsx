import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description = 'Check back later for updates.',
  icon,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon || <FileX className="h-12 w-12 text-muted-foreground" />}
    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
  </div>
);

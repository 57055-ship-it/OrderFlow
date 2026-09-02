import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  actionButton = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border/60 rounded-xl my-4">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
}

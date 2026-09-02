import React from 'react';

export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-muted/40 border-b border-border flex items-center px-6 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-16 flex items-center px-6 gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-muted/60 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { History, User, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderAuditHistory({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl">
        No modification history recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <History className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">Modification & Activity History</h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {history.map((item, index) => (
          <div key={index} className="relative flex flex-col gap-1 text-xs">
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.userName || 'User'}</span>
                <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {item.action}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.timestamp ? format(new Date(item.timestamp), 'dd MMM yyyy, HH:mm') : ''}
              </span>
            </div>

            {item.field && (
              <p className="text-muted-foreground">
                Field: <span className="font-medium text-foreground">{item.field}</span>
              </p>
            )}

            {item.previousValue || item.newValue ? (
              <div className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-muted/40 text-foreground font-mono text-[11px]">
                <span className="text-rose-500 line-through truncate max-w-[150px]">
                  {item.previousValue || '(empty)'}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-emerald-500 font-semibold truncate max-w-[180px]">
                  {item.newValue || '(empty)'}
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

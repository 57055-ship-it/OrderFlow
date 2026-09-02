import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-extrabold text-foreground">404 - Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        The requested resource or page does not exist or may have been moved.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl shadow flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </button>
    </div>
  );
}

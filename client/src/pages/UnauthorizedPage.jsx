import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-extrabold text-foreground">403 - Access Denied</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        You don't have permission to access this page or perform this action.
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

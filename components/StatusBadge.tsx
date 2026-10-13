import React from 'react';
import { OrderStatus } from '@/lib/types';
import { ORDER_STATUS_META } from '@/lib/order-state';
import { Clock, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const meta = ORDER_STATUS_META[status] || {
    label: status,
    badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200'
  };

  const getIcon = () => {
    switch (status) {
      case 'pending_payment':
        return <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse text-amber-600" />;
      case 'paid':
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />;
      case 'processing':
        return <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-purple-600" />;
      case 'completed':
        return <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition-colors ${meta.badgeClass} ${className}`}
    >
      {getIcon()}
      {meta.label}
    </span>
  );
}

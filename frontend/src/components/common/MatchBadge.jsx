import React from 'react';
import { Sparkles } from 'lucide-react';

const MatchBadge = ({ score, size = 'md', className = '' }) => {
  const numScore = Math.round(Number(score) || 0);

  let badgeColor = 'bg-primary-50 text-primary-700 border-primary-200';
  if (numScore >= 85) {
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (numScore >= 70) {
    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${badgeColor} ${sizes[size] || sizes.md} ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
      <span>{numScore}% AI Match</span>
    </span>
  );
};

export default MatchBadge;

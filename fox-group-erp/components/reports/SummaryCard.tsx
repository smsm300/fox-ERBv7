import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  color: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, color }) => (
  <div className="bg-dark-900 p-4 rounded-lg border border-dark-800">
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

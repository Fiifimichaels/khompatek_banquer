import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface TransactionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

export const TransactionButton: React.FC<TransactionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 ${className}`}
    >
      <div className="flex items-center justify-center space-x-2">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
    </button>
  );
};
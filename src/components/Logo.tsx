import React from 'react';
import { Smartphone, Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl shadow-lg flex items-center justify-center`}>
        <Zap className={`${sizeClasses[size === 'sm' ? 'sm' : size === 'md' ? 'sm' : size === 'lg' ? 'md' : 'lg']} text-white`} />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          Khompatek
        </span>
      )}
    </div>
  );
};
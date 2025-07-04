import React from 'react';
import { Smartphone, DollarSign } from 'lucide-react';
import khompatekLogo from '../assets/khompatek_logo.png';

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
      <img
        src={khompatekLogo}
        alt="Khompatek Logo"
        className={`${sizeClasses[size]} rounded-xl shadow-lg object-contain`}
      />
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          Khompatek
        </span>
      )}
    </div>
  );
};
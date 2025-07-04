import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Wifi, Signal, Battery, Smartphone } from 'lucide-react';

export const Header: React.FC = () => {
  const { state } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <Logo size="sm" showText={true} />
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <Wifi className="w-4 h-4" />
          <Signal className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <span>94%</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-blue-600">
            Dual SIM detected - Agent / EVD SIM(s) required to process transactions.
          </p>
        </div>
        <p className="text-xs text-red-600 font-medium">Get help or learn how to use Khompatek.</p>
        <p className="text-xs text-green-600 mt-1">
          ✓ Multiple network support available
        </p>
      </div>
    </header>
  );
};
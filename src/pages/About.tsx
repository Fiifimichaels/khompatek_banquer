import React from 'react';
import { Logo } from '../components/Logo';
import { Shield, Zap, Database, Smartphone, Bell, Wifi } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <Logo size="lg" showText={false} className="filter brightness-0 invert" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">About Khompatek</h1>
        <p className="text-blue-100 text-center">
          Fastest, easiest, and most accurate way for agents to process mobile money transactions.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-center mb-4">
          <Logo size="md" showText={true} />
        </div>
        <p className="text-gray-700 mb-4 font-medium text-center">
          Khompatek - process more, earn more.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Khompatek brings automation to let mobile money agents complete cash deposit, cash-out, airtime 
          transfer and all other mobile money transactions in just a few seconds. No more dialing and 
          re-dialing long USSD codes. No more writing down every transaction in a notebook. Khompatek 
          automates the transaction and records it for you. It works across all networks and does not 
          require internet access.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Key Features:</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Faster and more accurate transactions:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Speed and accuracy cannot be overemphasized in a commission based business such as that 
                of a mobile money agent. No need to dial and re-dial USSD prompts. Khompatek automates USSD 
                prompts and uses optical character recognition and machine learning modules to help you 
                transact faster and more accurately.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Fraud Protection:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Khompatek detects when you are about to perform a transaction to a fraudulent number and 
                warns you to keep you and your customers safe. With built-in fraud reporting, Khompatek 
                has the largest database of fraudsters and helps make mobile money safer.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-100 rounded-xl flex-shrink-0">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Automatic Record-keeping and Analytics:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No more pen and paper record keeping. Successful transactions are automatically recorded 
                locally on your device for faster search when necessary. Graphical analytics also gives 
                you meaningful insights on your transactions. You can have a detailed overview of daily, 
                weekly, and monthly transactions with a click of a button.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
              <Smartphone className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Dual SIM Support:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Khompatek automatically detects if your device supports multiple SIM cards and optimizes 
                transaction routing across different networks. This ensures you can serve customers from 
                all major networks efficiently.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-yellow-100 rounded-xl flex-shrink-0">
              <Wifi className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">No internet access required:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We considered the availability of stable internet as well as the charges it comes with, 
                and we made this app totally offline functional to help agents process transactions 
                faster anytime, anywhere.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-100 rounded-xl flex-shrink-0">
              <Bell className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">SMS alerts and awareness:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We keep you in the loop. Get SMS alerts on new fraud schemes and other meaningful momo 
                business insights. Get to know of network downturns and automatically retry transactions 
                when necessary.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-6 space-y-2">
        <p>A MMAAG and MOMAG partner.</p>
        <p>© 2024 Khompatek. All rights reserved.</p>
        <p className="text-xs">Version 1.0.0 - Mobile Optimized</p>
      </div>
    </div>
  );
};
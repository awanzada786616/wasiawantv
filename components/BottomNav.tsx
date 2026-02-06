
import React from 'react';
import { Tv, Home, Clapperboard } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'tv' | 'movies';
  onTabChange: (tab: 'home' | 'tv' | 'movies') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tv', icon: Tv, label: 'Live Tv' },
    { id: 'movies', icon: Clapperboard, label: 'Movies' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#070707] border-t border-white/5 py-3 pb-8 z-50 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-red-500 scale-110' : 'text-gray-500'}`}
            // Fixed duplicate onClick and undefined onSelect
            onClick={() => onTabChange(tab.id as any)}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

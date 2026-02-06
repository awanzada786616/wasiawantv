
import React, { useState, useEffect } from 'react';
import { Smartphone, X, Zap } from 'lucide-react';

interface LiteAnnouncementModalProps {
  onClose: () => void;
}

export const LiteAnnouncementModal: React.FC<LiteAnnouncementModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a short delay to ensure splash is gone
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      {/* Modal Card */}
      <div className={`relative bg-[#0a0a0a] w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(220,38,38,0.25)] overflow-hidden transform transition-all duration-700 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${isVisible ? 'scale-100 translate-y-0 rotate-0' : 'scale-75 translate-y-20 rotate-3'}`}>
        
        {/* Top Glow Decor */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-600/20 to-transparent pointer-events-none"></div>

        <div className="p-10 relative flex flex-col items-center text-center">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors active:scale-75"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-600 blur-[30px] opacity-40 animate-pulse"></div>
            <div className="relative bg-red-600 p-6 rounded-3xl shadow-2xl">
              <Smartphone className="w-10 h-10 text-white" />
              <Zap className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white mb-4">
            Lite Version <br/> <span className="text-red-600">Coming Soon</span>
          </h2>
          
          <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10 px-2">
            We are launching <span className="text-white font-bold">Waisi TV Lite</span> specifically optimized for <span className="text-red-500 font-bold">low-end devices</span>. Faster loading, less data, and ultra-smooth playback.
          </p>

          {/* Main Action */}
          <button 
            onClick={onClose}
            className="w-full py-5 bg-white text-black font-black rounded-3xl uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 transition-all mb-8"
          >
            Stay Tuned
          </button>

          {/* Signature */}
          <div className="flex flex-col items-center gap-1.5 opacity-40">
            <div className="h-[1px] w-8 bg-gray-600 mb-1"></div>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-500">Developed By</p>
            <p className="text-[11px] font-[1000] italic uppercase tracking-tighter text-white">Awais Haider</p>
          </div>
        </div>
      </div>
    </div>
  );
};

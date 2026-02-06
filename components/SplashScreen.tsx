
import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldExit(true), 4800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#000000] flex flex-col items-center justify-center transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) ${shouldExit ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
      
      {/* Dynamic Background FX */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_50%)] animate-[pulse_4s_infinite]"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      {/* WT Logo Container */}
      <div className="relative flex flex-col items-center select-none">
        <div className="relative group">
          {/* Layered Glows */}
          <div className="absolute -inset-10 bg-red-600/30 blur-[60px] rounded-full animate-pulse opacity-50"></div>
          <div className="absolute -inset-20 bg-red-600/10 blur-[100px] rounded-full animate-[pulse_6s_infinite] delay-700"></div>
          
          <div className="relative flex items-center justify-center">
             {/* Main WT Typography */}
             <h1 className="text-[120px] md:text-[180px] font-[1000] italic tracking-[-0.15em] leading-none flex items-center">
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-[wt-reveal_1.5s_ease-out_forwards]">W</span>
                <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] animate-[wt-reveal_1.5s_ease-out_0.3s_forwards] opacity-0">T</span>
             </h1>

             {/* Glitch Overlay (Invisible until animation) */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="text-[120px] md:text-[180px] font-[1000] italic tracking-[-0.15em] leading-none text-red-600/30 mix-blend-screen animate-[glitch_2s_infinite] opacity-0 group-hover:opacity-100">WT</span>
             </div>
          </div>
        </div>
        
        {/* Cinematic Subtitle */}
        <div className="mt-4 flex flex-col items-center gap-1">
           <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-red-600/50 to-transparent mb-2"></div>
           <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.8em] text-gray-400 animate-[slide-up_2s_ease-out_1s_both]">
             Universal Media Hub
           </p>
        </div>
      </div>

      {/* Advanced Progress Sequence */}
      <div className="absolute bottom-20 flex flex-col items-center gap-4 w-full px-12">
        <div className="relative w-full max-w-[200px] h-[2px] bg-white/5 rounded-full overflow-hidden">
          {/* Animated Glow behind progress bar */}
          <div className="absolute inset-y-0 left-0 bg-red-600/40 blur-sm h-full animate-[loading-fill_4.2s_ease-in-out_forwards]"></div>
          {/* Main Progress Bar */}
          <div className="relative h-full bg-gradient-to-r from-red-800 via-red-600 to-red-400 animate-[loading-fill_4.2s_ease-in-out_forwards]"></div>
        </div>
        
        <div className="flex items-center gap-2 opacity-60">
            <div className="w-1 h-1 bg-red-600 rounded-full animate-ping"></div>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                Authenticating Waisi-Net
            </span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-[7px] font-black uppercase tracking-[0.2em] text-gray-800">
          Copyright © 2024 Waisi TV Labs. All Rights Reserved.
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wt-reveal {
          0% { transform: translateY(40px) scale(0.85); opacity: 0; filter: blur(20px); }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes glitch {
          0% { transform: translate(0); opacity: 0.5; clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%); }
          2% { transform: translate(-5px, 2px); opacity: 0.8; }
          4% { transform: translate(5px, -2px); opacity: 0.8; }
          6% { transform: translate(0); opacity: 0.5; clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%); }
          100% { transform: translate(0); opacity: 0.5; }
        }
        @keyframes loading-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};


import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, ArrowLeft, Maximize2, RefreshCw
} from 'lucide-react';
import { fetchChannelUrl } from '../utils/jazzApi';

interface VideoPlayerProps {
  url?: string;
  slug?: string;
  name?: string;
  type?: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, slug, name, type, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const [state, setState] = useState({
    isPlaying: false,
    showControls: true,
    isFirstLoad: true,
    error: null as string | null,
    aspectRatio: 'contain' as 'contain' | 'cover' | 'fill'
  });

  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBack = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
    }
    onClose();
  };

  const toggleAspectRatio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'cover', 'fill'];
    const nextIndex = (modes.indexOf(state.aspectRatio) + 1) % modes.length;
    setState(p => ({ ...p, aspectRatio: modes[nextIndex] }));
  };

  // Improved Auto-Play Utility
  const safePlay = async (video: HTMLVideoElement) => {
    try { 
      // Force unmuted attempt first
      video.muted = false;
      await video.play(); 
    } catch (err) {
      // Fallback to muted auto-play if unmuted is blocked
      console.warn("Unmuted autoplay blocked, falling back to muted.");
      video.muted = true;
      video.play().catch(e => console.error("Playback failed completely:", e));
    }
  };

  useEffect(() => {
    let hls: Hls | null = null;
    let isActive = true;
    let timeoutId: number;
    const video = videoRef.current;
    if (!video) return;

    const initStream = async () => {
        let playUrl = url;
        setState(p => ({ ...p, isFirstLoad: true, error: null }));
        
        timeoutId = window.setTimeout(() => {
          if (isActive && state.isFirstLoad && !playUrl) {
            setState(p => ({ ...p, error: "Gateway Timeout" }));
          }
        }, 12000);

        try {
            if (slug) {
              playUrl = await fetchChannelUrl(slug, type || 'channel');
            }
            
            if (!playUrl || !isActive) {
              if (isActive) setState(p => ({ ...p, error: "Stream Offline" }));
              return;
            }

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    manifestLoadingMaxRetry: 3,
                    levelLoadingMaxRetry: 3,
                    startLevel: -1,
                });
                hlsRef.current = hls;
                hls.loadSource(playUrl);
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => { 
                  if (isActive) {
                    // Start Playing Automatically
                    safePlay(video);
                    setState(p => ({ ...p, isFirstLoad: false }));
                  }
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                  if (data.fatal && isActive) {
                    switch (data.type) {
                      case Hls.ErrorTypes.NETWORK_ERROR:
                        hls?.startLoad();
                        break;
                      case Hls.ErrorTypes.MEDIA_ERROR:
                        hls?.recoverMediaError();
                        break;
                      default:
                        setState(p => ({ ...p, error: "Buffer Error" }));
                        hls?.destroy();
                        break;
                    }
                  }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
                video.addEventListener('loadedmetadata', () => { 
                  if (isActive) {
                    safePlay(video);
                    setState(p => ({ ...p, isFirstLoad: false }));
                  }
                });
            }
        } catch (e) { 
          if (isActive) setState(p => ({ ...p, error: "Link Expired" })); 
        }
    };

    const handlePlaying = () => { if (isActive) setState(p => ({ ...p, isPlaying: true, isFirstLoad: false })); };
    const handlePause = () => { if (isActive) setState(p => ({ ...p, isPlaying: false })); };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);

    initStream();
    
    return () => { 
      isActive = false; 
      window.clearTimeout(timeoutId);
      if (hls) hls.destroy(); 
      if (video) { video.pause(); video.src = ""; } 
    };
  }, [url, slug, retryCount]);

  const containerStyle: React.CSSProperties = isPortrait
    ? { position: 'fixed', top: '50%', left: '50%', width: '100vh', height: '100vw', transform: 'translate(-50%, -50%) rotate(90deg)', zIndex: 9999, backgroundColor: 'black' }
    : { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, backgroundColor: 'black' };

  return (
    <div 
      style={containerStyle} 
      className="overflow-hidden flex items-center justify-center bg-black select-none" 
      onClick={() => setState(p => ({ ...p, showControls: !p.showControls }))}
    >
      <video ref={videoRef} className={`w-full h-full object-${state.aspectRatio}`} playsInline crossOrigin="anonymous" />
      
      {/* Loading Overlay */}
      {state.isFirstLoad && !state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-[100]">
           <div className="flex flex-col items-center">
             <h1 className="text-8xl font-[1000] italic tracking-tighter text-red-600 animate-pulse">WAISI</h1>
             <div className="mt-6 w-36 h-1 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 animate-[loading_1.5s_infinite]"></div>
             </div>
             <p className="mt-4 text-[7px] font-black uppercase text-gray-700 tracking-[0.4em]">Starting Stream...</p>
           </div>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[110] p-10 text-center">
          <RefreshCw className="w-10 h-10 text-red-600 animate-spin mb-6" />
          <p className="text-white text-sm font-black uppercase mb-8 tracking-widest text-red-500">{state.error}</p>
          <div className="flex gap-4">
             <button onClick={(e) => { e.stopPropagation(); setRetryCount(c => c + 1); }} className="px-10 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase active:scale-90">Retry</button>
             <button onClick={() => handleBack()} className="px-10 py-4 bg-red-600 text-white rounded-full text-[10px] font-black uppercase active:scale-90">Close</button>
          </div>
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-50 transition-opacity duration-300 ${state.showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center">
            <button onClick={(e) => handleBack(e)} className="p-5 bg-black/70 backdrop-blur-3xl rounded-full active:scale-75 border border-white/20 transition-all z-[120]" style={{ pointerEvents: 'auto' }}>
                <ArrowLeft className="w-8 h-8 text-white" />
            </button>
            <div className="ml-5 bg-black/60 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/10">
                <h2 className="text-[12px] font-black tracking-widest uppercase text-white truncate max-w-[200px]">{name || 'WAISI TV'}</h2>
            </div>
        </div>
        
        {/* Bottom controls only, removed the central play button */}
        <div className="absolute bottom-0 left-0 right-0 p-10 flex justify-between items-end pb-16 px-12">
            <button onClick={(e) => { e.stopPropagation(); if (videoRef.current) state.isPlaying ? videoRef.current.pause() : safePlay(videoRef.current); }} className="p-6 bg-red-600 rounded-2xl active:scale-90 shadow-xl pointer-events-auto">
                {state.isPlaying ? <Pause className="w-7 h-7 text-white fill-white" /> : <Play className="w-7 h-7 text-white fill-white" />}
            </button>

            <button onClick={toggleAspectRatio} className="flex flex-col items-center gap-1 bg-black/80 backdrop-blur-3xl px-8 py-4 rounded-3xl border border-white/10 active:scale-90 pointer-events-auto">
                <Maximize2 className="w-6 h-6 text-red-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{state.aspectRatio === 'contain' ? 'Canvas' : state.aspectRatio === 'cover' ? 'Zoom' : 'Fill'}</span>
            </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}} />
    </div>
  );
};

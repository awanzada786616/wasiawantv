import React, { useState, useEffect, useRef } from 'react';
import { Channel, SliderItem } from './types';
import { fetchJazzChannels, fetchHomeSections, fetchGenrePrograms } from './utils/jazzApi';
import { ChannelList } from './components/ChannelList';
import { VideoPlayer } from './components/VideoPlayer';
import { Slider } from './components/Slider';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { HomeHeader } from './components/HomeHeader';
import { HorizontalRow } from './components/HorizontalRow';
import { LiteAnnouncementModal } from './components/LiteAnnouncementModal';
import { Zap, MessageCircle, Send } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'tv' | 'movies'>('home');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [movies, setMovies] = useState<Channel[]>([]);
  const [sports, setSports] = useState<Channel[]>([]);
  const [homeSections, setHomeSections] = useState<{ title: string; items: Channel[] }[]>([]);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showLiteModal, setShowLiteModal] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    initApp();
    const timer = setTimeout(() => {
      setShowSplash(false);
      const hasSeenLite = localStorage.getItem('hasSeenLiteAnnouncement');
      if (!hasSeenLite) {
        setShowLiteModal(true);
      }
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const initApp = async () => {
    setIsLoading(true);
    try {
      await loadInitialData();
    } catch (e) {
      console.error("Initialization failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [homeData, tvData, sportsData, moviesData] = await Promise.all([
        fetchHomeSections(),
        fetchJazzChannels(),
        fetchGenrePrograms('sports'),
        fetchGenrePrograms('movies')
      ]);

      setSliderItems(homeData.slider || []);
      
      const sections = homeData.chunks.map((c: any) => ({
        title: c.categoryName || c.name || "Featured",
        items: (c.programs || []).map((p: any) => ({
          id: p.slug || p.id,
          name: p.programName || p.name || "Untitled",
          logo: p.portrait_poster || p.image || p.poster,
          slug: p.slug,
          type: p.type || 'vod'
        }))
      })).filter(s => s.items.length > 0 && !s.title.toLowerCase().includes('movies'));

      setHomeSections(sections);
      setChannels(tvData);
      setSports(sportsData);
      setMovies(moviesData);
    } catch (e) { 
      console.error("Data load failed", e); 
    }
  };

  const handleSelectChannel = (channel: Channel) => {
    setCurrentChannel(channel);
  };

  const closePlayer = () => {
    setCurrentChannel(null);
  };

  const closeLiteModal = () => {
    localStorage.setItem('hasSeenLiteAnnouncement', 'true');
    setShowLiteModal(false);
  };

  return (
    <div className="h-screen bg-[#070707] text-white font-sans overflow-hidden flex flex-col">
      {showSplash && <SplashScreen />}
      {showLiteModal && <LiteAnnouncementModal onClose={closeLiteModal} />}
      
      <div className="z-30 bg-[#070707] pt-4 pb-2 px-6 flex justify-between items-center border-b border-white/5">
         <div className="flex items-center gap-2 px-4 py-1.5 bg-red-600 rounded-full">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">Waisi TV</span>
         </div>
         <div className="flex gap-4">
            <a href="https://wa.me/923342002756" target="_blank" rel="noopener noreferrer" className="text-green-500 active:scale-90 transition-transform"><MessageCircle className="w-5 h-5" /></a>
            <a href="https://t.me/aloneboywasi" target="_blank" rel="noopener noreferrer" className="text-blue-400 active:scale-90 transition-transform"><Send className="w-5 h-5" /></a>
         </div>
      </div>

      <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-7xl mx-auto px-4">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                  <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Securing Gateway...</span>
                </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    {activeTab === 'home' && (
                        <>
                            <HomeHeader />
                            {sliderItems.length > 0 && <Slider items={sliderItems} onSelect={i => handleSelectChannel({ ...i, name: i.title, logo: i.thumbnail })} />}
                            {sports.length > 0 && <HorizontalRow title="Live Sports" items={sports} onSelect={handleSelectChannel} />}
                            {homeSections.map((s, i) => (
                              <HorizontalRow key={i} title={s.title} items={s.items} onSelect={handleSelectChannel} />
                            ))}
                        </>
                    )}

                    {activeTab === 'tv' && (
                      <div className="pt-6">
                        <h2 className="text-lg font-black uppercase tracking-tighter mb-4 px-2">Live Channels</h2>
                        <ChannelList channels={channels} onSelectChannel={handleSelectChannel} columns={3} />
                      </div>
                    )}
                    
                    {activeTab === 'movies' && (
                      <div className="pt-6">
                        <h2 className="text-lg font-black uppercase tracking-tighter mb-4 px-2">All Movies</h2>
                        <ChannelList channels={movies} onSelectChannel={handleSelectChannel} isMovie={true} columns={3} />
                      </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {currentChannel && (
        <VideoPlayer 
          url={currentChannel.url} 
          slug={currentChannel.slug} 
          name={currentChannel.name} 
          type={currentChannel.type} 
          onClose={closePlayer} 
        />
      )}
      
      <BottomNav activeTab={activeTab as any} onTabChange={setActiveTab as any} />
    </div>
  );
};

export default App;
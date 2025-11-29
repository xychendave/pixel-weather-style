
import React, { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import OutfitPanel from './components/OutfitPanel';
import AvatarMaker from './components/AvatarMaker';
import { OutfitData, OutfitImages, WeatherData, UserStats, ThemeName, THEMES, ThemeColors } from './types';
import { generateOutfitRecommendation, generateAvatarImage, generateItemThumbnail, generateAvatarVideo } from './services/geminiService';

// --- MOCK DATA FOR STATIC PAGE (Fallback) ---
const DEMO_WEATHER: WeatherData = {
  locationName: "Pixel City",
  temperature: "22°C",
  condition: "晴朗",
  landmark: "Retro Tower",
  description: "Perfect weather for an adventure in the digital world!",
  isSunny: true,
  sourceUrl: "#"
};

const DEMO_OUTFIT: OutfitData = {
  hat: "Straw Hat",
  top: "White Tee",
  bottom: "Denim Skirt",
  outerwear: "Cardigan",
  shoes: "Sneakers",
  accessories: "Camera"
};

// Simple SVG Placeholders that look acceptable in pixel art context
const createPlaceholder = (color: string, icon: string) => 
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="none"/><text x="50%" y="50%" font-family="monospace" font-size="30" fill="${color}" text-anchor="middle" dy=".3em">${icon}</text></svg>`;

const DEMO_IMAGES: OutfitImages = {
  hat: createPlaceholder('#8B4513', '👒'),
  top: createPlaceholder('#FFFFFF', '👕'),
  bottom: createPlaceholder('#4682B4', '👖'),
  outerwear: createPlaceholder('#FFB7C5', '🧥'),
  shoes: createPlaceholder('#333333', '👟'),
  accessories: createPlaceholder('#FFA500', '📷'),
};

// --- Seasonal Particle Component ---
const SeasonalEffects: React.FC<{ theme: ThemeName }> = ({ theme }) => {
  const [particles, setParticles] = useState<{id: number, left: string, delay: string, duration: string, size: number}[]>([]);

  useEffect(() => {
    // Create random particles
    const count = theme === 'Summer' ? 20 : 40; 
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 12}s`,
      size: Math.floor(Math.random() * 6) + 4
    }));
    setParticles(newParticles);
  }, [theme]);

  if (theme === 'Spring') {
    // Sakura Petals (Pink/White)
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map(p => (
          <div 
            key={p.id}
            className="animate-fall absolute"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: '-20px',
              backgroundColor: Math.random() > 0.5 ? '#FFB7C5' : '#FFF0F5',
              borderRadius: '40% 60% 50% 50%'
            }}
          />
        ))}
      </div>
    );
  }

  if (theme === 'Autumn') {
    // Falling Leaves (Orange/Brown pixels)
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map(p => (
          <div 
            key={p.id}
            className="animate-fall absolute"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: `${p.size + 2}px`,
              height: `${p.size + 2}px`,
              top: '-20px',
              backgroundColor: Math.random() > 0.5 ? '#CD853F' : '#8B4513'
            }}
          />
        ))}
      </div>
    );
  }

  if (theme === 'Winter') {
    // Snow (White squares)
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map(p => (
          <div 
            key={p.id}
            className="animate-fall absolute bg-white opacity-90"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: `${parseFloat(p.duration) * 0.6}s`, // Falls faster
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: '-20px',
              boxShadow: '1px 1px 0 rgba(0,0,0,0.1)'
            }}
          />
        ))}
      </div>
    );
  }

  if (theme === 'Summer') {
    // Sun sparkles / Heat haze
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map(p => (
          <div 
            key={p.id}
            className="animate-twinkle absolute"
            style={{
              left: p.left,
              top: `${Math.random() * 100}%`,
              animationDelay: p.delay,
              animationDuration: '4s',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#E0FFFF',
              boxShadow: '0 0 4px #fff'
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};


function App() {
  // Initialize with DEMO data so the app looks good immediately (Static Page Mode)
  const [weather, setWeather] = useState<WeatherData | null>(DEMO_WEATHER);
  const [outfit, setOutfit] = useState<OutfitData | null>(DEMO_OUTFIT);
  const [outfitImages, setOutfitImages] = useState<OutfitImages | null>(DEMO_IMAGES);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // Start null to show Base Model SVG
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false); 
  const [imgLoading, setImgLoading] = useState(false); 
  const [videoLoading, setVideoLoading] = useState(false);
  
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('Spring');
  const themeColors = THEMES[currentTheme];

  // Try to fetch real weather silently on mount, but don't clear demo data until success
  useEffect(() => {
    if ("geolocation" in navigator) {
        // We pass a dummy function to WeatherCard usually, 
        // but here we manage state in App mostly. 
        // The WeatherCard component will try to fetch.
    }
  }, []);

  const handleWeatherLoaded = (data: WeatherData) => {
    setWeather(data);
  };

  const handleGenerate = async (stats: UserStats) => {
      if (!weather) {
          alert("请等待天气加载完成 / Please wait for weather to load");
          return;
      }

      setLoading(true);
      // Only clear previous data if we are actually generating
      setOutfit(null);
      setOutfitImages(null);
      setVideoUrl(null);
      setAvatarUrl(null);

      try {
          const newOutfit = await generateOutfitRecommendation(weather, stats);
          setOutfit(newOutfit);
          
          const avatarResult = await generateAvatarImage(stats, newOutfit);
          setAvatarUrl(avatarResult);
          setLoading(false); 

          setImgLoading(true);
          const newImages: OutfitImages = {};
          const itemsToGen: {key: keyof OutfitImages, val: string, cat: string}[] = [];
          
          if (newOutfit.hat) itemsToGen.push({key: 'hat', val: newOutfit.hat, cat: 'Headwear'});
          if (newOutfit.dress) {
              itemsToGen.push({key: 'dress', val: newOutfit.dress, cat: 'Dress'});
          } else {
              if (newOutfit.top) itemsToGen.push({key: 'top', val: newOutfit.top, cat: 'Top'});
              if (newOutfit.bottom) itemsToGen.push({key: 'bottom', val: newOutfit.bottom, cat: 'Bottom'});
          }
          if (newOutfit.outerwear) itemsToGen.push({key: 'outerwear', val: newOutfit.outerwear, cat: 'Outerwear'});
          if (newOutfit.shoes) itemsToGen.push({key: 'shoes', val: newOutfit.shoes, cat: 'Shoes'});
          if (newOutfit.accessories) itemsToGen.push({key: 'accessories', val: newOutfit.accessories, cat: 'Accessory'});

          for (const item of itemsToGen) {
              try {
                  const url = await generateItemThumbnail(item.val, item.cat);
                  if (url) {
                      newImages[item.key] = url;
                      setOutfitImages(prev => ({ ...prev, [item.key]: url }));
                  }
                  // Delay to avoid Rate Limit
                  await new Promise(r => setTimeout(r, 6000));
              } catch (e) {
                  console.warn(`Failed to generate icon for ${item.key}`);
              }
          }

      } catch (error: any) {
          console.error("Generation failed", error);
          let msg = "生成失败，请重试 / Generation failed";
          if (error.message && error.message.includes('429')) {
              msg = "API 额度已耗尽 (展示静态模式) / Rate Limit Hit (Showing Static Demo)";
              // Restore Demo Data on error so it doesn't look broken
              setOutfit(DEMO_OUTFIT);
              setOutfitImages(DEMO_IMAGES);
          }
          alert(msg);
          setLoading(false);
      } finally {
          setImgLoading(false);
      }
  };

  const handleDepart = async () => {
      if (!avatarUrl || !weather) return;

      setVideoLoading(true);
      try {
          const url = await generateAvatarVideo(avatarUrl, weather);
          setVideoUrl(url);
      } catch (e) {
          console.error("Video Gen Error", e);
          alert("动画生成失败 (Check API Key selection or Quota)");
      } finally {
          setVideoLoading(false);
      }
  }

  return (
    <div 
        className={`w-full h-full flex flex-col overflow-hidden relative transition-colors duration-700 ${themeColors.patternClass}`}
        style={{ backgroundColor: themeColors.bgMain, color: themeColors.text }}
    >
      {/* Seasonal Particle Effects */}
      <SeasonalEffects theme={currentTheme} />

      {/* Theme Selector */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 bg-white/90 p-2 border-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]" style={{borderColor: themeColors.border}}>
         {(['Spring', 'Summer', 'Autumn', 'Winter'] as ThemeName[]).map(t => (
             <button
                key={t}
                onClick={() => setCurrentTheme(t)}
                className={`px-3 py-1 text-xs font-bold border-2 transition-all ${currentTheme === t ? 'translate-y-[2px] opacity-100' : 'shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] opacity-70 hover:opacity-100'}`}
                style={{
                    backgroundColor: currentTheme === t ? themeColors.accent : '#FFF',
                    borderColor: themeColors.border,
                    color: themeColors.text
                }}
             >
                 {t === 'Spring' ? '🌸 春' : t === 'Summer' ? '☀️ 夏' : t === 'Autumn' ? '🍂 秋' : '❄️ 冬'}
             </button>
         ))}
      </div>

      <div className="w-full h-full flex flex-col md:flex-row p-4 md:p-8 gap-6 max-w-7xl mx-auto mt-8 relative z-10">
        
        {/* Left Column: Weather & Outfit */}
        <div className="flex-1 flex flex-col gap-6 h-full min-w-0">
          
          {/* Top Left: Weather Card */}
          <div className="h-[35%] min-h-[220px]">
            <WeatherCard onWeatherLoaded={handleWeatherLoaded} theme={themeColors} />
          </div>

          {/* Bottom Left: Wardrobe */}
          <div className="flex-1 min-h-0">
            <OutfitPanel 
              outfit={outfit} 
              outfitImages={outfitImages}
              loading={loading && !outfit} 
              imgLoading={imgLoading}
              waitingForUser={!outfit && !loading}
              theme={themeColors}
            />
          </div>

        </div>

        {/* Right Column: Avatar Maker */}
        <div className="flex-1 h-full min-w-0">
          <AvatarMaker 
              outfit={outfit} 
              onGenerate={handleGenerate} 
              loading={loading} 
              generatedImage={avatarUrl}
              videoUrl={videoUrl}
              videoLoading={videoLoading}
              onDepart={handleDepart}
              theme={themeColors}
          />
        </div>

      </div>
    </div>
  );
}

export default App;

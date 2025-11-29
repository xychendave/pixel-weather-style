
import React, { useEffect, useState } from 'react';
import { WeatherData, ThemeColors } from '../types';
import { fetchWeather, generateLandmarkImage } from '../services/geminiService';

interface WeatherCardProps {
  onWeatherLoaded: (data: WeatherData) => void;
  theme: ThemeColors;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ onWeatherLoaded, theme }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [landmarkImg, setLandmarkImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
          setWeather(data);
          onWeatherLoaded(data);
          
          generateLandmarkImage(data.landmark, data.condition).then(setLandmarkImg);
          
          setLoading(false);
        } catch (err) {
            console.error(err);
          setError("无法获取天气信息");
          setLoading(false);
        }
      }, (err) => {
        setError("请允许获取位置权限以显示天气");
        setLoading(false);
      });
    } else {
      setError("您的浏览器不支持地理位置功能");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div 
        className="h-full w-full flex flex-col items-center justify-center pixel-card"
        style={{ backgroundColor: theme.bgCard, borderColor: theme.border, boxShadow: `8px 8px 0px 0px ${theme.border}` }}
    >
       <div className="text-2xl animate-pulse mb-2">📡 CONNECTING...</div>
       <span className="font-bold" style={{color: theme.text}}>正在获取气象数据</span>
    </div>
  );

  if (error) return (
    <div 
        className="h-full w-full flex items-center justify-center pixel-card p-4 text-center"
        style={{ backgroundColor: theme.bgCard, borderColor: theme.border, boxShadow: `8px 8px 0px 0px ${theme.border}` }}
    >
      <span className="text-lg text-red-600 font-bold">ERROR: {error}</span>
    </div>
  );

  return (
    <div 
        className="relative h-full w-full pixel-card overflow-hidden flex flex-col group"
        style={{ borderColor: theme.border, boxShadow: `8px 8px 0px 0px ${theme.border}` }}
    >
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 bg-[#87CEEB] image-pixelated">
             {landmarkImg ? (
                 <img src={landmarkImg} alt="landmark" className="w-full h-full object-cover opacity-100" />
             ) : (
                 <div className="w-full h-full bg-[#87CEEB]" />
             )}
             
             {/* Moving Pixel Clouds Layer */}
             <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {/* Pixel Cloud 1 */}
                <div className="absolute top-4 left-0 w-24 h-8 bg-white opacity-90 animate-drift pixel-cloud" style={{animationDuration: '20s', animationDelay: '0s'}}>
                   <div className="absolute -top-4 left-4 w-16 h-4 bg-white"></div>
                </div>
                {/* Pixel Cloud 2 */}
                <div className="absolute top-20 left-0 w-32 h-8 bg-white opacity-80 animate-drift pixel-cloud" style={{animationDuration: '35s', animationDelay: '-10s'}}>
                    <div className="absolute -top-4 left-8 w-16 h-4 bg-white"></div>
                </div>
             </div>

             {weather?.isRainy && (
                 <div className="absolute inset-0 pointer-events-none z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDNIMlY0SDF6IiBmaWxsPSIjMDAwMENDIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-50"></div>
             )}
             {weather?.isSunny && (
                 <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-400 border-4 border-black animate-spin-slow z-10" style={{boxShadow: '4px 4px 0 rgba(0,0,0,0.2)'}} />
             )}
        </div>
        
        {/* HUD Content Layer */}
        <div className="relative z-20 p-4 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div className="bg-white border-4 px-2 py-1" style={{borderColor: theme.border, boxShadow: `4px 4px 0 0 ${theme.border}`}}>
                    <h2 className="text-xl font-bold uppercase" style={{color: theme.text}}>{weather?.locationName}</h2>
                    <p className="text-xs text-gray-600 uppercase">LOC: {weather?.landmark}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
                <div className="bg-white border-4 p-2 text-right" style={{borderColor: theme.border, boxShadow: `4px 4px 0 0 ${theme.border}`}}>
                    <div className="text-4xl font-black leading-none" style={{color: theme.text}}>{weather?.temperature}</div>
                    <div className="text-sm font-bold uppercase mt-1" style={{color: theme.text}}>{weather?.condition}</div>
                </div>
                
                <div className="bg-[#FFFAF0] border-4 p-2 max-w-[90%]" style={{borderColor: theme.border, boxShadow: `4px 4px 0 0 ${theme.border}`}}>
                   <p className="text-xs font-bold leading-tight" style={{color: theme.text}}>"{weather?.description}"</p>
                   {weather?.sourceUrl && (
                        <a 
                            href={weather.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block text-[10px] text-blue-600 hover:bg-blue-100 mt-1 text-right font-bold uppercase decoration-2 underline"
                        >
                            [SOURCE]
                        </a>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default WeatherCard;

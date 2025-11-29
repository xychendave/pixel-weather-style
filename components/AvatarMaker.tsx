
import React, { useState, useRef } from 'react';
import { Gender, UserStats, OutfitData, ThemeColors, SkinTone } from '../types';

interface AvatarMakerProps {
  outfit: OutfitData | null;
  onGenerate: (stats: UserStats) => void;
  loading: boolean;
  generatedImage: string | null;
  videoUrl: string | null;
  videoLoading: boolean;
  onDepart: () => void;
  theme: ThemeColors;
}

const AvatarMaker: React.FC<AvatarMakerProps> = ({ 
    outfit, onGenerate, loading, generatedImage, 
    videoUrl, videoLoading, onDepart, theme 
}) => {
  const [stats, setStats] = useState<UserStats>({
    gender: Gender.Female,
    age: 20,
    hairLength: '中长发', // Default
    hairColor: '棕色',    // Default
    skinTone: '正常',
    weight: '适中',
    uploadedImage: null
  });

  // Local state for custom inputs
  const [isCustomHairStyle, setIsCustomHairStyle] = useState(false);
  const [customHairStyle, setCustomHairStyle] = useState("");
  const [customHairColor, setCustomHairColor] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStats(prev => ({ ...prev, uploadedImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const PRESET_HAIR_COLORS = ['黑色', '棕色', '金色', '红色', '粉色', '银白'];
  const PRESET_HAIR_STYLES = ['短发', '中长发', '长发', '马尾', '双马尾', '卷发', '光头'];

  return (
    <div className="h-full flex flex-col pixel-card overflow-hidden" style={{backgroundColor: theme.bgCard, borderColor: theme.border, boxShadow: `8px 8px 0px 0px ${theme.border}`}}>
      {/* Header */}
      <div className="p-2 border-b-4 flex justify-center relative z-20" style={{backgroundColor: theme.accent, borderColor: theme.border}}>
        <h2 className="text-xl font-bold tracking-widest drop-shadow-md" style={{color: theme.text}}>CHARACTER CREATOR</h2>
      </div>

      {/* Preview Area (Top Half) */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden group border-b-4 bg-gray-100" 
        style={{borderColor: theme.border, backgroundColor: theme.sky}}
      >
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
        
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
             {loading ? (
                <div className="flex flex-col items-center animate-pulse">
                    <div className="text-4xl mb-2">🔮</div>
                    <p className="text-sm font-bold bg-white px-2 border-2" style={{color: theme.text, borderColor: theme.border}}>GENERATING...</p>
                </div>
             ) : videoLoading ? (
                <div className="flex flex-col items-center justify-center bg-black/50 absolute inset-0 text-white z-50">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="font-bold text-sm uppercase tracking-widest">Generating Video...</p>
                </div>
             ) : videoUrl ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center shadow-lg border-2 border-white">
                    <video src={videoUrl} autoPlay loop controls className="w-full h-full object-contain" />
                    <button onClick={onDepart} className="absolute bottom-2 right-2 bg-white border-2 border-black px-2 py-1 text-[10px] font-bold hover:bg-gray-200">REPLAY</button>
                </div>
             ) : generatedImage ? (
                <img 
                    src={generatedImage} 
                    alt="Generated Avatar" 
                    className="h-full w-auto object-contain image-pixelated drop-shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
                />
             ) : stats.uploadedImage ? (
                <div className="relative h-full w-auto">
                    <img 
                        src={stats.uploadedImage} 
                        alt="Reference" 
                        className="h-full w-auto object-contain border-4 border-white shadow-md rotate-2"
                    />
                    <div className="absolute top-2 right-2 bg-yellow-300 text-[10px] px-1 border border-black font-bold">REF IMAGE</div>
                </div>
             ) : (
                <div className="text-center opacity-50">
                    <div className="text-6xl mb-2">👤</div>
                    <p className="font-bold text-xs">NO AVATAR</p>
                </div>
             )}
        </div>
      </div>

      {/* Controls Area (Bottom Half - Scrollable) */}
      <div className="p-3 relative z-20 flex flex-col gap-3 overflow-y-auto max-h-[50%]" style={{backgroundColor: theme.bgCard}}>
        
        {/* Row 1: Skin & Gender */}
        <div className="flex gap-4">
             <div className="flex-1">
                <label className="text-[10px] font-bold uppercase block mb-1" style={{color: theme.text}}>肤色 Skin</label>
                <div className="flex gap-1">
                    {(['白皙', '正常', '小麦色', '深色'] as SkinTone[]).map(tone => (
                        <button
                            key={tone}
                            onClick={() => setStats({...stats, skinTone: tone})}
                            className={`w-6 h-6 border-2 transition-transform ${stats.skinTone === tone ? 'scale-110 border-black ring-1 ring-white' : 'border-gray-400'}`}
                            style={{backgroundColor: tone === '白皙' ? '#FFF0E0' : tone === '正常' ? '#FFCD94' : tone === '小麦色' ? '#EAC086' : '#8D5524'}}
                            title={tone}
                        />
                    ))}
                </div>
             </div>
             <div className="w-1/3">
                 <label className="text-[10px] font-bold uppercase block mb-1" style={{color: theme.text}}>性别 Gender</label>
                 <select 
                    className="pixel-input w-full py-1 px-1 font-bold text-xs"
                    style={{borderColor: theme.border}}
                    value={stats.gender}
                    onChange={(e) => setStats({...stats, gender: e.target.value as Gender})}
                 >
                    {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
             </div>
        </div>

        {/* Row 2: Hair Color */}
        <div>
            <label className="text-[10px] font-bold uppercase block mb-1" style={{color: theme.text}}>发色 Hair Color</label>
            <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1">
                    {PRESET_HAIR_COLORS.map(color => (
                        <button
                        key={color}
                        onClick={() => {
                            setStats({...stats, hairColor: color});
                            setCustomHairColor(""); 
                        }}
                        className={`w-5 h-5 border-2 ${stats.hairColor === color && !customHairColor ? 'border-black scale-110 ring-1 ring-white' : 'border-transparent'}`}
                        style={{backgroundColor: color === '黑色' ? '#222' : color === '棕色' ? '#634e34' : color === '金色' ? '#EDD255' : color === '红色' ? '#D04040' : color === '粉色' ? '#FFB7C5' : '#E0E0E0'}}
                        title={color}
                    />
                    ))}
                </div>
                <input 
                    type="text" 
                    placeholder="自定义..." 
                    className="pixel-input flex-1 min-w-[60px] text-xs py-1 px-2"
                    style={{borderColor: theme.border}}
                    value={customHairColor}
                    onChange={(e) => {
                        setCustomHairColor(e.target.value);
                        setStats({...stats, hairColor: e.target.value});
                    }}
                />
            </div>
        </div>

        {/* Row 3: Hair Style */}
        <div>
            <label className="text-[10px] font-bold uppercase block mb-1" style={{color: theme.text}}>发型 Hairstyle</label>
            <div className="flex gap-2">
                <select 
                    className="pixel-input flex-1 py-1 px-1 font-bold text-xs"
                    style={{borderColor: theme.border}}
                    value={isCustomHairStyle ? "Custom" : stats.hairLength}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Custom") {
                            setIsCustomHairStyle(true);
                            setStats({...stats, hairLength: customHairStyle});
                        } else {
                            setIsCustomHairStyle(false);
                            setStats({...stats, hairLength: val});
                        }
                    }}
                >
                    {PRESET_HAIR_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Custom">自定义 (Custom)...</option>
                </select>
                {isCustomHairStyle && (
                    <input 
                        type="text" 
                        placeholder="输入发型..."
                        className="pixel-input flex-1 text-xs py-1 px-2"
                        style={{borderColor: theme.border}}
                        value={customHairStyle}
                        onChange={(e) => {
                            setCustomHairStyle(e.target.value);
                            setStats({...stats, hairLength: e.target.value});
                        }}
                        autoFocus
                    />
                )}
            </div>
        </div>
        
        {/* Row 4: Upload & Age */}
        <div className="flex gap-2 items-center mt-1">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 text-[10px] border-2 py-2 font-bold hover:bg-white transition-colors flex items-center justify-center gap-1"
                style={{borderColor: theme.border, color: theme.text, backgroundColor: stats.uploadedImage ? '#e6fffa' : 'transparent'}}
            >
                <span>{stats.uploadedImage ? "📷 更换照片" : "📷 上传照片"}</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            
            <div className="flex-1 flex items-center gap-2 border-2 px-2 py-1" style={{borderColor: theme.border}}>
                <label className="text-[10px] font-bold whitespace-nowrap" style={{color: theme.text}}>年龄 {stats.age}</label>
                <input 
                    type="range" min="10" max="80" 
                    value={stats.age} 
                    onChange={(e) => setStats({...stats, age: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 appearance-none cursor-pointer"
                    style={{accentColor: theme.button}}
                />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
            <button 
                onClick={() => onGenerate(stats)}
                disabled={loading}
                className={`flex-1 py-3 text-lg pixel-btn ${loading ? 'opacity-50' : ''}`}
                style={{backgroundColor: theme.button, borderColor: theme.border, color: theme.text, boxShadow: `4px 4px 0px 0px ${theme.border}`}}
            >
                {outfit ? "✨ 生成形象" : "⚡ 先获取穿搭"}
            </button>

            {outfit && generatedImage && (
                <button 
                    onClick={onDepart}
                    disabled={videoLoading}
                    className="flex-1 py-3 text-lg pixel-btn animate-pulse"
                    style={{backgroundColor: '#4CAF50', borderColor: theme.border, color: 'white', boxShadow: `4px 4px 0px 0px ${theme.border}`}}
                >
                    🚀 出发!
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default AvatarMaker;

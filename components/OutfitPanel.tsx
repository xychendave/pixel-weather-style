
import React from 'react';
import { OutfitData, OutfitImages, ThemeColors } from '../types';

interface OutfitPanelProps {
  outfit: OutfitData | null;
  outfitImages: OutfitImages | null;
  loading: boolean;
  imgLoading: boolean;
  waitingForUser: boolean;
  theme: ThemeColors;
}

const ItemCard: React.FC<{ label: string; value?: string; img?: string, theme: ThemeColors }> = ({ label, value, img, theme }) => (
  <div className="h-full bg-[#FFF8E7] border-4 p-2 flex flex-col justify-between relative group hover:bg-white transition-colors" style={{borderColor: theme.woodDark}}>
    <span className="text-[10px] font-bold uppercase mb-1 border-b-2 block w-full text-left" style={{color: theme.woodDark, borderColor: theme.woodLight}}>{label}</span>
    
    {/* Image Container - Centered */}
    <div className="flex-1 w-full flex items-center justify-center p-1 relative mb-1 overflow-hidden image-pixelated">
        {img ? (
            <img src={img} alt={value} className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-75" />
        ) : (
            <div className="text-2xl font-bold select-none opacity-30" style={{color: theme.woodLight}}>?</div>
        )}
    </div>

    <span className="text-[10px] md:text-xs text-center font-bold leading-tight truncate w-full block" style={{color: theme.text}}>
      {value || "..."}
    </span>
  </div>
);

const OutfitPanel: React.FC<OutfitPanelProps> = ({ outfit, outfitImages, loading, imgLoading, waitingForUser, theme }) => {
  const isOpen = !!outfit && !loading;

  return (
    <div className="h-full w-full perspective-container relative">
      
      {/* Wardrobe Cabinet Box */}
      <div className="h-full w-full relative flex flex-col overflow-hidden border-4" style={{backgroundColor: theme.woodDark, borderColor: theme.border, boxShadow: `8px 8px 0px 0px ${theme.border}`}}>
        
        {/* Header */}
        <div className="h-10 flex items-center justify-center border-b-4 shrink-0" style={{backgroundColor: theme.woodLight, borderColor: theme.border}}>
           <div className="px-4 border-2" style={{backgroundColor: theme.woodDark, borderColor: theme.woodLight}}>
              <h3 className="text-xs font-bold text-[#FFF8E7] uppercase tracking-widest">WARDROBE</h3>
           </div>
        </div>

        {/* Wardrobe Interior (Content) */}
        <div className="flex-1 relative w-full overflow-y-auto p-3" style={{backgroundColor: theme.woodDark}}>
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]"></div>

             {/* Content Grid */}
             <div className="relative z-10 h-full">
               {outfit ? (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 h-full pb-2">
                      <ItemCard label="HEAD" value={outfit.hat} img={outfitImages?.hat} theme={theme} />
                      
                      {!!outfit.dress ? (
                          <div className="col-span-1 row-span-2 bg-[#FFF8E7] border-4 p-2 flex flex-col group hover:bg-white" style={{borderColor: theme.woodDark}}>
                              <span className="text-[10px] font-bold uppercase mb-1 border-b-2" style={{color: theme.woodDark, borderColor: theme.woodLight}}>BODY</span>
                              <div className="flex-1 flex items-center justify-center mb-1 overflow-hidden image-pixelated">
                                  {outfitImages?.dress ? (
                                      <img src={outfitImages.dress} alt={outfit.dress} className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-75" />
                                  ) : (
                                      <div className="text-4xl opacity-30">👗</div>
                                  )}
                              </div>
                              <span className="text-xs text-center font-bold truncate w-full" style={{color: theme.text}}>{outfit.dress}</span>
                          </div>
                      ) : (
                          <>
                              <ItemCard label="TORSO" value={outfit.top} img={outfitImages?.top} theme={theme} />
                              <ItemCard label="LEGS" value={outfit.bottom} img={outfitImages?.bottom} theme={theme} />
                          </>
                      )}
                      
                      <ItemCard label="OUTER" value={outfit.outerwear} img={outfitImages?.outerwear} theme={theme} />
                      <ItemCard label="FEET" value={outfit.shoes} img={outfitImages?.shoes} theme={theme} />
                      <ItemCard label="ITEM" value={outfit.accessories} img={outfitImages?.accessories} theme={theme} />
                   </div>
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center opacity-50" style={{color: theme.woodLight}}>
                     <div className="text-4xl mb-2">🔒</div>
                     <p className="font-bold uppercase">LOCKED</p>
                 </div>
               )}
             </div>
        </div>

        {/* Pixel Doors Overlay */}
        <div className="absolute inset-0 z-20 flex pointer-events-none top-10">
            {/* Left Door */}
            <div 
                className={`relative w-1/2 h-full border-r-4 origin-left door-transform flex items-center justify-end ${isOpen ? 'door-left-open' : ''}`}
                style={{backgroundColor: theme.woodLight, borderColor: theme.border}}
            >
                {/* Texture Pattern */}
                <div className="absolute inset-0 opacity-20 pixel-wood"></div>
                {/* Hinge */}
                <div className="absolute left-1 top-10 w-2 h-6 border" style={{backgroundColor: theme.woodDark, borderColor: theme.border}}></div>
                <div className="absolute left-1 bottom-10 w-2 h-6 border" style={{backgroundColor: theme.woodDark, borderColor: theme.border}}></div>
                {/* Handle - Dynamic Color */}
                <div 
                    className="w-4 h-12 border-4 border-black mr-4 shadow-sm z-10 relative" 
                    style={{backgroundColor: theme.handle}}
                ></div>
            </div>

            {/* Right Door */}
            <div 
                className={`relative w-1/2 h-full border-l-4 origin-right door-transform flex items-center justify-start ${isOpen ? 'door-right-open' : ''}`}
                style={{backgroundColor: theme.woodLight, borderColor: theme.border}}
            >
                {/* Texture Pattern */}
                 <div className="absolute inset-0 opacity-20 pixel-wood"></div>
                 {/* Hinge */}
                <div className="absolute right-1 top-10 w-2 h-6 border" style={{backgroundColor: theme.woodDark, borderColor: theme.border}}></div>
                <div className="absolute right-1 bottom-10 w-2 h-6 border" style={{backgroundColor: theme.woodDark, borderColor: theme.border}}></div>
                {/* Handle - Dynamic Color */}
                <div 
                    className="w-4 h-12 border-4 border-black ml-4 shadow-sm z-10 relative" 
                    style={{backgroundColor: theme.handle}}
                ></div>
            </div>
        </div>

        {/* Message Overlay when Loading */}
        {loading && !outfit && (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <div className="bg-white border-4 px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]" style={{borderColor: theme.border}}>
                    <span className="text-black font-bold animate-pulse">CRAFTING ITEMS...</span>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default OutfitPanel;

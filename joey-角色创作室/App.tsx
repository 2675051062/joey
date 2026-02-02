
import React, { useState } from 'react';
import { generateJoeyImage } from './services/geminiService';
import { JoeyConfig, GeneratedImage } from './types';
import { PRESET_ACTIONS, PRESET_CLOTHING, PRESET_ACCESSORIES, ASPECT_RATIOS } from './constants';

const App: React.FC = () => {
  const [config, setConfig] = useState<JoeyConfig>({
    action: PRESET_ACTIONS[0],
    clothing: PRESET_CLOTHING[0],
    accessory: PRESET_ACCESSORIES[0],
    scene: "",
    styleDescription: "",
    aspectRatio: ASPECT_RATIOS[0].value
  });
  
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setReferenceImage(base64String);
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!referenceImage) {
      setError("请先上传 Joey 的原型图作为生成参考。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const imageUrl = await generateJoeyImage(config, referenceImage);
      setCurrentImage(imageUrl);
      
      const newEntry: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        config: { ...config },
        timestamp: Date.now()
      };
      
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message || "生成失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `Joey_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#EAD7C3] p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
               <span className="text-white font-fredoka text-xl">J</span>
            </div>
            <h1 className="text-2xl font-fredoka text-blue-600 tracking-wide">Joey 角色创作室</h1>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">AIGC 灵感工作室</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#EAD7C3]">
            <h2 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              创意面板
            </h2>

            {/* Reference Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">1. 原型图上传 (基础一致性)</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                  id="reference-upload"
                />
                <label 
                  htmlFor="reference-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${referenceImage ? 'border-green-400 bg-green-50' : 'border-[#EAD7C3] hover:border-blue-400 bg-gray-50'}`}
                >
                  {referenceImage ? (
                    <div className="flex flex-col items-center p-2 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs text-green-600 font-bold uppercase tracking-tight">Joey 已就位</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-2 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-xs text-gray-400 font-bold uppercase">上传 Joey 原图</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-6">
              {/* Size Select */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">2. 尺寸选择</label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setConfig({...config, aspectRatio: ratio.value})}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border-2 transition-all ${config.aspectRatio === ratio.value ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'}`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">动作姿态 (可手动输入)</label>
                <div className="relative">
                  <input 
                    type="text"
                    list="actions-list"
                    value={config.action}
                    onChange={(e) => setConfig({...config, action: e.target.value})}
                    placeholder="输入或选择预设动作"
                    className="w-full bg-[#fcf8f5] border-2 border-[#EAD7C3] rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                  />
                  <datalist id="actions-list">
                    {PRESET_ACTIONS.map(a => <option key={a} value={a} />)}
                  </datalist>
                </div>
              </div>

              {/* Clothing and Accessory Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">服装样式</label>
                  <input 
                    type="text"
                    list="clothing-list"
                    value={config.clothing}
                    onChange={(e) => setConfig({...config, clothing: e.target.value})}
                    placeholder="卫衣, 衬衫..."
                    className="w-full bg-[#fcf8f5] border-2 border-[#EAD7C3] rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                  />
                  <datalist id="clothing-list">
                    {PRESET_CLOTHING.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">配饰</label>
                  <input 
                    type="text"
                    list="accessory-list"
                    value={config.accessory}
                    onChange={(e) => setConfig({...config, accessory: e.target.value})}
                    placeholder="墨镜, 帽子..."
                    className="w-full bg-[#fcf8f5] border-2 border-[#EAD7C3] rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                  />
                  <datalist id="accessory-list">
                    {PRESET_ACCESSORIES.map(acc => <option key={acc} value={acc} />)}
                  </datalist>
                </div>
              </div>

              {/* Style Description */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">风格微调</label>
                <input 
                  type="text"
                  placeholder="柔和光影, 复古感, 粗笔触..."
                  value={config.styleDescription}
                  onChange={(e) => setConfig({...config, styleDescription: e.target.value})}
                  className="w-full bg-[#fcf8f5] border-2 border-[#EAD7C3] rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {/* Scene Input */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">背景场景</label>
                <textarea 
                  placeholder="例如：巴黎街头, 森林木屋, 海边日落..."
                  value={config.scene}
                  onChange={(e) => setConfig({...config, scene: e.target.value})}
                  className="w-full bg-[#fcf8f5] border-2 border-[#EAD7C3] rounded-xl px-4 py-2 h-20 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !referenceImage}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-xl text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3
                  ${loading || !referenceImage ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joey 正在变身...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    开始 AIGC 生成
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Display & History */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Main Display Area */}
          <div className="bg-white rounded-[40px] p-6 shadow-2xl border-2 border-[#EAD7C3] relative overflow-hidden flex flex-col items-center justify-center min-h-[600px]">
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl z-20 flex items-center justify-between shadow-sm">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="font-bold text-red-400 hover:text-red-600 transition-colors">&times;</button>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-fredoka text-blue-500 text-lg">J</div>
                </div>
                <p className="mt-6 text-blue-600 font-bold text-xl animate-pulse tracking-widest">正在为您精心绘制 Joey...</p>
              </div>
            )}

            {currentImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="shadow-2xl rounded-2xl overflow-hidden border-4 border-[#EAD7C3] bg-gray-50 transition-all duration-500 transform hover:scale-[1.01] relative group" style={{ maxWidth: '100%', maxHeight: '500px' }}>
                  <img 
                    src={currentImage} 
                    alt="Joey AIGC Result" 
                    className="w-full h-full object-contain"
                  />
                  {/* Hover Overlay with Download */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-4 pointer-events-none">
                    <div className="pointer-events-auto">
                      <button 
                        onClick={() => downloadImage(currentImage)}
                        className="bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 flex items-center gap-2"
                        title="下载高清原图"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Download Button */}
                <button 
                  onClick={() => downloadImage(currentImage)}
                  className="mt-6 flex items-center gap-2 bg-white border-2 border-[#EAD7C3] px-6 py-2 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  保存此插画
                </button>
              </div>
            ) : (
              <div className="text-center p-12 text-gray-400">
                <div className="w-32 h-32 bg-[#fcf8f5] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="font-bold text-xl text-gray-500">创作预览区</p>
                <p className="text-sm mt-2">您的专属 Joey 插画将在此生成</p>
              </div>
            )}

            {/* Config Badges */}
            {currentImage && (
              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">比例: {config.aspectRatio}</span>
                <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100 uppercase tracking-tighter">动作: {config.action}</span>
                <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100 uppercase tracking-tighter">服装: {config.clothing}</span>
              </div>
            )}
          </div>

          {/* History / Gallery */}
          {history.length > 0 && (
            <div className="bg-white rounded-[40px] p-6 shadow-xl border-2 border-[#EAD7C3]">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   最近创作库
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x scrollbar-hide">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex-shrink-0 w-36 snap-start group cursor-pointer"
                    onClick={() => setCurrentImage(item.url)}
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-[#EAD7C3] hover:border-blue-400 transition-all transform hover:scale-105 shadow-sm bg-gray-50 relative">
                      <img src={item.url} alt="Joey History" className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloadImage(item.url); }}
                        className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                      </button>
                    </div>
                    <div className="mt-2 px-1">
                      <p className="text-[10px] font-bold text-gray-500 truncate">{item.config.action || "未命名姿态"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 py-12 bg-white border-t-2 border-[#EAD7C3]">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="font-bold text-gray-400 text-sm">Joey Character Studio © 2024 • 基于 Gemini 2.5 Flash Image 核心驱动</p>
          <p className="text-[10px] text-gray-300 mt-2 uppercase tracking-widest">Minimalist Character Design System</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

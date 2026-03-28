import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudUpload, 
  Camera, 
  LayoutGrid, 
  Sparkles, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Menu,
  Info,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cn } from './lib/utils';
import { STYLE_OPTIONS, type GenerationStep, type StyleOption } from './types';
import { analyzeImageFor3D, generate3DModel } from './services/aiService';
import { ModelViewer } from './components/ModelViewer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'create' | 'gallery' | 'styles' | 'profile'>('create');
  const [step, setStep] = useState<GenerationStep>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(STYLE_OPTIONS[0]);
  const [progress, setProgress] = useState(0);
  const [generatedModel, setGeneratedModel] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [galleryItems, setGalleryItems] = useState<{id: string, image: string, model: string}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setStep('style');
        setCurrentTab('create');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const enableCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Unable to access camera. Please check permissions.");
          setIsCameraActive(false);
        }
      }
    };

    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const startCamera = () => {
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
        setStep('style');
        setCurrentTab('create');
      }
    }
  };

  const startGeneration = async () => {
    if (!selectedImage || !selectedStyle) return;
    
    setStep('processing');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 5;
      });
    }, 500);

    try {
      const result = await generate3DModel(selectedImage, selectedStyle.id);
      setGeneratedModel(result.modelUrl);
      setGalleryItems(prev => [{
        id: Date.now().toString(),
        image: selectedImage,
        model: result.modelUrl
      }, ...prev]);
      setProgress(100);
      setTimeout(() => setStep('preview'), 500);
    } catch (error) {
      console.error(error);
    } finally {
      clearInterval(interval);
    }
  };

  const handleDownload = () => {
    if (!generatedModel) return;
    const link = document.createElement('a');
    link.href = generatedModel;
    link.download = `avatar-${Date.now()}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Download started! (Mock GLB file)");
  };

  const handleTabChange = (tab: typeof currentTab) => {
    if (tab === 'styles' || tab === 'profile') {
      alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} feature is coming soon!`);
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Menu className="text-on-surface-variant cursor-pointer" />
          <span className="text-xl font-headline font-bold tracking-widest uppercase">Digital Atelier</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            <button onClick={() => handleTabChange('create')} className={cn("font-headline font-bold text-lg transition-colors", currentTab === 'create' ? "text-primary" : "text-on-surface-variant")}>Create</button>
            <button onClick={() => handleTabChange('gallery')} className={cn("font-headline font-bold text-lg transition-colors", currentTab === 'gallery' ? "text-primary" : "text-on-surface-variant")}>Gallery</button>
            <button onClick={() => handleTabChange('styles')} className="font-headline font-bold text-lg text-on-surface-variant hover:opacity-80">Styles</button>
          </nav>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden cursor-pointer" onClick={() => handleTabChange('profile')}>
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpOh6Uq6lSDpAtdwGgld-aCtObIwhx-NHBX3d9HcJ_wF78hKdNY43nDg0QWiaaVrs9Y2k2IyZMCZnL51sxZIGfQohHfkcdLEdnaxpnNa6ZTO10KeG6oBgftChlUqWlspb2zuqSkMKlM9qBe93bcClAEpqA_7Ll7XjhlIwbIxYgIliurFnIvgt0vH1jnuaxdB0ea-Q2tu04rjFTtKTkxGlSmXkeNwZjgfCWyujdJDa_VfJWIKDxEBwA0MYokwNBMf3e-xZxFE-ob1in" 
              alt="User"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {currentTab === 'create' && (
            <motion.div key="create-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnimatePresence mode="wait">
                {step === 'upload' && (
                  <motion.section 
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-20"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                      <div className="flex-1 text-center md:text-left">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary mb-4 block">New Generation</span>
                        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                          Transform Your <br />
                          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Digital Persona</span>
                        </h1>
                        <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light">
                          Upload a single portrait and let our neural engine synthesize a high-fidelity 3D character with hyper-realistic textures.
                        </p>
                      </div>
                      <div className="flex-1 w-full max-w-md relative">
                        <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl relative group">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb4xf4LszPu5k4ESmfQpKfuDX7S-brztvqM7ADZpC2kNVw4Yun5QTHAoKM4myOdLJE-NtlO1-IpOFWf1b6l39h1aCqiLAjlS9zMhiHnePmo6NytOgY3qr0qK6pnvS2LMN_iBtHmljSk2sJBEj1t-UIuGxcq8iwxExq8wPm-wgdV7WZ4xbEcWZYKtPqfqenCTLaNrxgfEFnOrggq9qnPhkpFd7XGpQ--DfsdEhk1nSwtlLc01Fvqxmgk2igWdpyb3qLZ-q7o39k5_eK" 
                            alt="AI Visualization"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent"></div>
                          <div className="absolute bottom-8 left-8 right-8 glass-panel rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <Sparkles className="text-white w-5 h-5" />
                              <span className="text-white font-medium">Neural Upscaling active</span>
                            </div>
                            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                              <motion.div 
                                className="bg-white h-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "66%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-8 md:p-16 text-center ai-glow">
                      <div className="max-w-2xl mx-auto">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="glass-panel border-2 border-dashed border-on-surface-variant/30 rounded-xl p-12 md:p-20 group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
                        >
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform">
                              <CloudUpload className="text-primary w-10 h-10" />
                            </div>
                            <h2 className="font-headline text-2xl md:text-3xl font-bold mb-3">Drop your image here</h2>
                            <p className="text-on-surface-variant mb-10">High-resolution JPEG or PNG preferred (Max 25MB)</p>
                            <button className="bg-gradient-to-br from-primary to-secondary text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                              Select from Device
                            </button>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 mt-12">
                          <button 
                            onClick={startCamera}
                            className="glass-panel px-8 py-4 rounded-full flex items-center gap-3 font-medium hover:bg-white/60 transition-colors shadow-sm"
                          >
                            <Camera className="w-5 h-5" /> Camera
                          </button>
                          <button 
                            onClick={() => handleTabChange('gallery')}
                            className="glass-panel px-8 py-4 rounded-full flex items-center gap-3 font-medium hover:bg-white/60 transition-colors shadow-sm"
                          >
                            <LayoutGrid className="w-5 h-5" /> Gallery
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Camera Modal */}
                    <AnimatePresence>
                      {isCameraActive && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[100] bg-on-surface/90 backdrop-blur-xl flex items-center justify-center p-6"
                        >
                          <div className="relative w-full max-w-2xl aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-12">
                              <button 
                                onClick={stopCamera}
                                className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                              >
                                <RefreshCw className="w-8 h-8" />
                              </button>
                              <button 
                                onClick={capturePhoto}
                                className="w-24 h-24 rounded-full bg-white p-2 shadow-2xl active:scale-90 transition-transform"
                              >
                                <div className="w-full h-full rounded-full border-4 border-black/10" />
                              </button>
                              <button 
                                onClick={stopCamera}
                                className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                              >
                                <span className="text-2xl font-bold">×</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>
                )}

                {step === 'style' && (
                  <motion.section 
                    key="style"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-16"
                  >
                    <div className="text-center md:text-left">
                      <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                        Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Visual Identity</span>
                      </h1>
                      <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl">
                        Choose an aesthetic blueprint to guide the AI generation of your 3D digital companion.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                      {STYLE_OPTIONS.map((style) => (
                        <div 
                          key={style.id}
                          onClick={() => setSelectedStyle(style)}
                          className="group relative"
                        >
                          {selectedStyle?.id === style.id && (
                            <div className="absolute -inset-4 ai-glow rounded-xl blur-2xl opacity-100" />
                          )}
                          <div className={cn(
                            "relative glass-panel rounded-xl overflow-hidden shadow-xl p-6 cursor-pointer transition-all border-2",
                            selectedStyle?.id === style.id ? "border-primary/40" : "border-transparent hover:border-surface-container"
                          )}>
                            <div className="aspect-[4/5] rounded-lg overflow-hidden mb-8 relative">
                              <img 
                                src={style.image} 
                                alt={style.title}
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              {selectedStyle?.id === style.id && (
                                <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
                                  <CheckCircle2 className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2 block">{style.category}</span>
                                <h2 className="font-headline text-3xl font-bold">{style.title}</h2>
                                <p className="text-on-surface-variant mt-2 text-sm">{style.description}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Complexity</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3].map(i => (
                                    <div 
                                      key={i} 
                                      className={cn(
                                        "w-4 h-1 rounded-full",
                                        i <= style.complexity ? "bg-primary" : "bg-surface-container-high"
                                      )} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center">
                      <button 
                        onClick={startGeneration}
                        className="group relative px-12 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-headline font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          Continue to Generation
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      </button>
                      <p className="mt-6 text-on-surface-variant text-sm flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        You can adjust secondary traits in the next step
                      </p>
                    </div>
                  </motion.section>
                )}

                {step === 'processing' && (
                  <motion.section 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto space-y-12"
                  >
                    <div className="aspect-[21/9] rounded-xl overflow-hidden bg-surface-container-low relative ai-glow">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full h-full">
                          <img 
                            src={selectedImage!} 
                            className="w-full h-full object-cover opacity-50" 
                            alt="Processing"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <RefreshCw className="w-12 h-12 text-white animate-spin mx-auto" />
                          <p className="text-white font-headline font-bold text-xl uppercase tracking-widest">Neural Synthesis in Progress</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-xl space-y-8">
                      <div className="flex justify-between items-end">
                        <div>
                          <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-2">Finalizing Details</h2>
                          <p className="text-on-surface-variant max-w-md">Our neural network is currently applying sub-pixel refinement and color grading to match your unique features.</p>
                        </div>
                        <div className="text-right">
                          <span className="font-headline text-4xl font-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                      </div>
                      <div className="relative w-full h-3 bg-surface-container rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: "0%" }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full transition-colors", progress > 30 ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant")}>
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Geometry mapped</span>
                        </div>
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full transition-colors", progress > 60 ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant")}>
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Palette synced</span>
                        </div>
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full transition-colors", progress > 90 ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant")}>
                          <RefreshCw className={cn("w-4 h-4", progress < 100 && "animate-spin")} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Smoothing edges</span>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}

                {step === 'preview' && (
                  <motion.section 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    <div className="lg:col-span-2 space-y-8">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl relative">
                        {generatedModel ? (
                          <ModelViewer url={generatedModel} />
                        ) : (
                          <div className="w-full h-full bg-surface-container animate-pulse" />
                        )}
                        <div className="absolute bottom-6 left-6 glass-panel px-4 py-2 rounded-full">
                          <span className="text-xs font-bold uppercase tracking-wider">3D Preview Mode</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">Polygon Count</span>
                          <div className="text-2xl font-headline font-bold">4.2M <span className="text-xs font-normal opacity-50">QUADS</span></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">Texture Set</span>
                          <div className="text-2xl font-headline font-bold">8K <span className="text-xs font-normal opacity-50">PBR</span></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">Rigging Type</span>
                          <div className="text-2xl font-headline font-bold">FACIAL <span className="text-xs font-normal opacity-50">DNA</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col justify-between h-full">
                        <div className="space-y-8">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-2 block">Current Style</span>
                            <h3 className="font-headline text-3xl font-bold">{selectedStyle?.title}</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-surface-container pb-2">
                              <span className="text-xs uppercase tracking-wider text-on-surface-variant">Resolution</span>
                              <span className="text-xs font-bold">1024 x 1024</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-surface-container pb-2">
                              <span className="text-xs uppercase tracking-wider text-on-surface-variant">Render Engine</span>
                              <span className="text-xs font-bold">Atelier v4.2</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-surface-container pb-2">
                              <span className="text-xs uppercase tracking-wider text-on-surface-variant">Style Weight</span>
                              <span className="text-xs font-bold">Medium Soft</span>
                            </div>
                          </div>

                          <div className="p-4 bg-surface-container-low rounded-lg">
                            <p className="text-sm text-on-surface-variant italic leading-relaxed">
                              "The neural engine successfully mapped 52 facial blend shapes to ensure full ARKit compatibility for real-time performance."
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 mt-12">
                          <button 
                            onClick={handleDownload}
                            className="w-full py-4 bg-gradient-to-br from-primary to-secondary text-white rounded-full font-headline font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform"
                          >
                            Download .GLB
                          </button>
                          <button 
                            onClick={() => setStep('upload')}
                            className="w-full py-4 bg-surface-container text-on-surface rounded-full font-headline font-bold text-lg hover:bg-surface-container-high transition-colors"
                          >
                            Create New
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentTab === 'gallery' && (
            <motion.section 
              key="gallery-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center md:text-left">
                <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                  Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Collection</span>
                </h1>
                <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl">
                  Browse and manage your previously generated 3D digital companions.
                </p>
              </div>

              {galleryItems.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-20 text-center">
                  <LayoutGrid className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-6" />
                  <p className="text-on-surface-variant text-xl">Your gallery is empty. Start creating!</p>
                  <button 
                    onClick={() => setCurrentTab('create')}
                    className="mt-8 px-8 py-3 bg-primary text-white rounded-full font-bold"
                  >
                    Create Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                      <div className="aspect-square relative overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Gallery item" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(item.image);
                              setGeneratedModel(item.model);
                              setStep('preview');
                              setCurrentTab('create');
                            }}
                            className="bg-white text-primary px-6 py-2 rounded-full font-bold"
                          >
                            View 3D
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="text-xs font-bold text-on-surface-variant">ID: {item.id.slice(-6)}</span>
                        <button className="text-primary hover:underline text-xs font-bold">Download</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pb-8 pt-4 bg-white/70 backdrop-blur-2xl rounded-t-[3rem] shadow-2xl">
        <div 
          onClick={() => handleTabChange('create')}
          className={cn("flex flex-col items-center p-3 transition-all cursor-pointer", currentTab === 'create' ? "bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-lg" : "text-on-surface-variant")}
        >
          <CloudUpload className="w-6 h-6" />
          <span className="text-[10px] uppercase font-bold mt-1">Create</span>
        </div>
        <div 
          onClick={() => handleTabChange('gallery')}
          className={cn("flex flex-col items-center p-3 transition-all cursor-pointer", currentTab === 'gallery' ? "bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-lg" : "text-on-surface-variant")}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] uppercase font-bold mt-1">Gallery</span>
        </div>
        <div 
          onClick={() => handleTabChange('styles')}
          className={cn("flex flex-col items-center p-3 transition-all cursor-pointer", currentTab === 'styles' ? "bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-lg" : "text-on-surface-variant")}
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-[10px] uppercase font-bold mt-1">Styles</span>
        </div>
        <div 
          onClick={() => handleTabChange('profile')}
          className={cn("flex flex-col items-center p-3 transition-all cursor-pointer", currentTab === 'profile' ? "bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-lg" : "text-on-surface-variant")}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] uppercase font-bold mt-1">Profile</span>
        </div>
      </nav>
    </div>
  );
}

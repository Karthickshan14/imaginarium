import React, { useState, useCallback } from 'react';
import { generateImageFromPrompt } from './services/geminiService';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ImageCard } from './components/ImageCard';
import { ImageUploader } from './components/ImageUploader';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ImageLightbox } from './components/ImageLightbox';
import { GeneratedImage, AspectRatio, UploadedImage } from './types';
import { Sparkles, Wand2, Loader2, ImagePlus, Upload, PenTool, Save, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'draw'>('upload');
  const [initialCanvasImage, setInitialCanvasImage] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<GeneratedImage | null>(null);
  const [hasMask, setHasMask] = useState(false);

  const handleGenerate = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    // Prompt engineering for masking
    let finalPrompt = prompt.trim();
    if (inputMode === 'draw' && hasMask) {
        finalPrompt = `(IMPORTANT: Modify ONLY the area highlighted in magenta to match this description: ${prompt}. Do NOT modify the rest of the image.)`;
    }

    try {
      const imageUrl = await generateImageFromPrompt(finalPrompt, aspectRatio, referenceImage);
      
      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: prompt.trim(), // Store original user prompt for display
        aspectRatio: aspectRatio,
        createdAt: Date.now(),
      };

      setImages((prev) => [newImage, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, aspectRatio, referenceImage, inputMode, hasMask]);

  const handleSaveSketch = () => {
    if (!referenceImage) return;

    const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: referenceImage.previewUrl,
        prompt: prompt.trim() || 'Hand-drawn Sketch',
        aspectRatio: AspectRatio.Wide, // Canvas is 4:3
        createdAt: Date.now(),
    };

    setImages((prev) => [newImage, ...prev]);
    
    const btn = document.activeElement as HTMLElement;
    if(btn) {
        btn.blur();
    }
  };

  const handleModeChange = (mode: 'upload' | 'draw') => {
    setInputMode(mode);
    if (mode === 'upload') {
        setInitialCanvasImage(null);
        setHasMask(false);
    }
  };

  const handleEdit = (image: GeneratedImage) => {
      setPrompt(image.prompt);
      setAspectRatio(image.aspectRatio as AspectRatio);
      setInputMode('draw');
      setInitialCanvasImage(image.url);
      setReferenceImage(null);
      setHasMask(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadEdit = (image: UploadedImage) => {
      setInputMode('draw');
      setInitialCanvasImage(image.previewUrl);
      setReferenceImage(null); 
      setHasMask(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
        setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-slate-200 selection:text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Minimal Header */}
        <header className="flex flex-col items-center justify-center mb-16 space-y-2">
            <h1 className="text-3xl font-light tracking-tight text-slate-900">
              Imaginarium
            </h1>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">
              AI Image Generator
            </p>
        </header>

        {/* Interaction Area */}
        <section className="max-w-4xl mx-auto mb-24">
          <div className="">
            <form onSubmit={handleGenerate} className="space-y-12">
                
                {/* Prompt Input */}
                <div className="relative group">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="What do you want to create?"
                        className="w-full py-4 bg-transparent border-b border-slate-200 text-3xl font-light text-slate-900 placeholder-slate-300 focus:outline-none focus:border-slate-400 transition-colors"
                        disabled={isGenerating}
                        autoFocus
                    />
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    {/* Reference Input */}
                    <div className="md:col-span-8 space-y-4">
                         <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reference</label>
                            <div className="flex bg-slate-100 rounded-full p-1">
                                <button
                                    type="button"
                                    onClick={() => handleModeChange('upload')}
                                    disabled={isGenerating}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${inputMode === 'upload' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Upload size={14} /> Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleModeChange('draw')}
                                    disabled={isGenerating}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${inputMode === 'draw' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <PenTool size={14} /> Draw
                                </button>
                            </div>
                         </div>
                        
                        {inputMode === 'upload' ? (
                            <ImageUploader 
                                onImageSelect={setReferenceImage} 
                                onEdit={handleUploadEdit}
                                disabled={isGenerating} 
                            />
                        ) : (
                            <DrawingCanvas
                                onImageChange={setReferenceImage}
                                onMaskingUsed={setHasMask}
                                disabled={isGenerating}
                                initialImage={initialCanvasImage}
                            />
                        )}
                    </div>

                    {/* Options Column */}
                    <div className="md:col-span-4 space-y-8 flex flex-col">
                         <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Aspect Ratio</label>
                            <AspectRatioSelector 
                                selectedRatio={aspectRatio} 
                                onSelect={setAspectRatio} 
                                disabled={isGenerating} 
                            />
                        </div>

                         <div className="flex-1 flex flex-col justify-end gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={!prompt.trim() || isGenerating}
                                className={`
                                    w-full py-3 px-6 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300
                                    ${!prompt.trim() || isGenerating 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'}
                                `}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate</span>
                                    </>
                                )}
                            </button>

                            {inputMode === 'draw' && referenceImage && !isGenerating && (
                                <button
                                    type="button"
                                    onClick={handleSaveSketch}
                                    className="w-full py-3 px-6 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    <Save size={16} />
                                    <span>Save Sketch</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>

             {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                    {error}
                </div>
            )}
          </div>
        </section>

        {/* Gallery */}
        <section>
          {images.length > 0 ? (
            <div>
               <div className="flex items-center gap-4 mb-8">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Creations</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
               </div>
               <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {images.map((img) => (
                    <ImageCard 
                        key={img.id} 
                        image={img} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                        onView={setViewingImage}
                    />
                ))}
               </div>
            </div>
          ) : (
            <div className="text-center py-20 opacity-30">
                <p className="text-slate-400 font-light text-lg">Your gallery is empty.</p>
            </div>
          )}
        </section>

        {/* Lightbox */}
        {viewingImage && (
            <ImageLightbox 
                image={viewingImage} 
                onClose={() => setViewingImage(null)} 
            />
        )}

      </div>
    </div>
  );
};

export default App;

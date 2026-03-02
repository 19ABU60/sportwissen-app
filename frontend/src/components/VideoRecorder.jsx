import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, VideoOff, Circle, Square, Play, Pause, 
  Camera, Save, Trash2, Download, RotateCcw,
  ChevronLeft, ChevronRight, X, ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Phase definitions for assignment
const PHASES = [
  { id: 1, title: "Angleiten", short: "1. Angl." },
  { id: 2, title: "Stoßauslage", short: "2. Stoß." },
  { id: 3, title: "Dreh-Streck", short: "3. Dreh" },
  { id: 4, title: "Abstoß", short: "4. Abst." },
];

export function VideoRecorder({ 
  onFrameCaptured,
  onVideoSaved,
  savedFrames = [],
  onDeleteFrame,
  onAssignFrame
}) {
  // Camera & Recording State
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  
  // Playback State
  const playbackRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Frame Capture State
  const canvasRef = useRef(null);
  const [capturedFrames, setCapturedFrames] = useState([]);
  
  // Frame Assignment State
  const [selectedFrame, setSelectedFrame] = useState(null);
  
  const handleAssignToPhase = (phaseId) => {
    if (selectedFrame && onAssignFrame) {
      onAssignFrame(phaseId, selectedFrame);
      toast.success(`Standbild zu Phase ${phaseId} zugewiesen`);
      setSelectedFrame(null);
    }
  };
  
  // Check for camera support
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
      } catch (err) {
        console.error("Camera check error:", err);
        setHasCamera(false);
      }
    };
    checkCamera();
  }, []);

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Kamera-Zugriff nicht möglich. Bitte Berechtigung erteilen.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Start recording
  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    chunksRef.current = [];
    const stream = videoRef.current.srcObject;
    
    // Check for supported MIME types (Safari/iOS uses mp4, Chrome/Firefox use webm)
    let mimeType = 'video/mp4';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    }
    
    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedBlob(blob);
        stopCamera();
        
        // Auto-save to media library with thumbnail
        autoSaveVideo(blob, mimeType, url);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      toast.success("Aufnahme gestartet");
    } catch (err) {
      console.error("MediaRecorder error:", err);
      toast.error("Aufnahme konnte nicht gestartet werden. Browser unterstützt diese Funktion möglicherweise nicht.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Aufnahme beendet");
    }
  };

  // Playback controls
  const togglePlayback = () => {
    if (!playbackRef.current) return;
    
    if (isPlaying) {
      playbackRef.current.pause();
    } else {
      playbackRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (playbackRef.current) {
      setCurrentTime(playbackRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (playbackRef.current) {
      setDuration(playbackRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (playbackRef.current) {
      playbackRef.current.currentTime = percent * duration;
      setCurrentTime(percent * duration);
    }
  };

  // Slider drag state
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const handleSliderStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    if (playbackRef.current && isPlaying) {
      playbackRef.current.pause();
      setIsPlaying(false);
    }
    handleSeek(e);
  };

  const handleSliderMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (playbackRef.current) {
      playbackRef.current.currentTime = percent * duration;
      setCurrentTime(percent * duration);
    }
  };

  const handleSliderEnd = () => {
    setIsDragging(false);
  };

  // Add global listeners for drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => handleSliderMove(e);
      const handleGlobalEnd = () => handleSliderEnd();
      
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('touchend', handleGlobalEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalEnd);
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('touchend', handleGlobalEnd);
      };
    }
  }, [isDragging, duration]);

  const stepFrame = (direction) => {
    if (!playbackRef.current) return;
    // Approximate frame step (assuming ~30fps)
    const frameTime = 1 / 30;
    playbackRef.current.currentTime = Math.max(0, 
      Math.min(duration, playbackRef.current.currentTime + (direction * frameTime))
    );
  };

  // Capture frame from video
  const captureFrame = async () => {
    if (!playbackRef.current || !canvasRef.current) return;
    
    const video = playbackRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const timestamp = video.currentTime;
    
    const newFrame = {
      id: Date.now(),
      imageUrl: imageDataUrl,
      timestamp: timestamp,
      createdAt: new Date().toISOString()
    };
    
    setCapturedFrames(prev => [...prev, newFrame]);
    
    if (onFrameCaptured) {
      onFrameCaptured(newFrame);
    }
    
    toast.success(`Standbild aufgenommen (${timestamp.toFixed(2)}s)`);
    
    // Auto-save frame to media library
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, `standbild_${timestamp.toFixed(1)}s_${Date.now()}.jpg`);
      formData.append('page', 'fehleranalyse');
      formData.append('section', `standbild_${Date.now()}`);
      
      const uploadResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/media/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (uploadResponse.ok) {
        toast.success("Standbild in Medienverwaltung gespeichert");
      }
    } catch (err) {
      console.error("Frame save error:", err);
    }
  };

  // Delete a captured frame
  const deleteFrame = (frameId) => {
    setCapturedFrames(prev => prev.filter(f => f.id !== frameId));
    if (onDeleteFrame) {
      onDeleteFrame(frameId);
    }
  };

  // Auto-save video to media library with thumbnail
  const [isSaving, setIsSaving] = useState(false);
  const [savedVideoId, setSavedVideoId] = useState(null);

  const autoSaveVideo = async (blob, mimeType, videoUrl) => {
    setIsSaving(true);
    try {
      const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
      const formData = new FormData();
      formData.append('file', blob, `aufnahme_${Date.now()}${ext}`);
      formData.append('page', 'fehleranalyse');
      formData.append('section', `video_${Date.now()}`);
      
      // Try to generate thumbnail, but don't fail if it doesn't work
      try {
        const thumbnailBlob = await generateThumbnail(videoUrl);
        if (thumbnailBlob) {
          formData.append('thumbnail', thumbnailBlob, `thumb_${Date.now()}.jpg`);
        }
      } catch (thumbErr) {
        console.warn("Thumbnail generation failed, saving without:", thumbErr);
      }
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/media/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedVideoId(data.media?.id);
        toast.success("Video in Medienverwaltung gespeichert!");
        if (onVideoSaved) onVideoSaved(data);
      } else {
        const errorText = await response.text();
        console.error("Upload response error:", response.status, errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (err) {
      console.error("Auto-save error:", err);
      toast.error("Video konnte nicht gespeichert werden. Bitte manuell speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateThumbnail = (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      
      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            video.src = '';
            resolve(blob);
          }, 'image/jpeg', 0.7);
        } catch (err) {
          console.error("Thumbnail generation error:", err);
          resolve(null);
        }
      };
      
      video.onerror = () => resolve(null);
      setTimeout(() => resolve(null), 5000);
    });
  };

  // Save video permanently (manual fallback)
  const saveVideoPermanently = async () => {
    if (!recordedBlob) return;
    
    try {
      const formData = new FormData();
      formData.append('file', recordedBlob, `video_${Date.now()}.webm`);
      formData.append('page', 'fehleranalyse');
      formData.append('section', 'videos');
      formData.append('media_type', 'video');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/media/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success("Video dauerhaft gespeichert!");
        if (onVideoSaved) {
          onVideoSaved(data);
        }
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Video save error:", err);
      toast.error("Fehler beim Speichern des Videos");
    }
  };

  // Reset / New recording
  const resetRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setCapturedFrames([]);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera/Recording Mode */}
      {!recordedVideoUrl && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
          {/* Video Preview */}
          <div className="relative aspect-video bg-zinc-900">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {!isStreaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                <Video className="w-12 h-12 mb-2" />
                <p className="text-sm">Kamera starten um aufzunehmen</p>
              </div>
            )}
            
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                <Circle className="w-3 h-3 fill-current" />
                <span className="text-sm font-medium">Aufnahme läuft...</span>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="p-3 flex items-center justify-center gap-2">
            {!isStreaming ? (
              <Button 
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!hasCamera}
                size="sm"
              >
                <Video className="w-4 h-4 mr-1" />
                Kamera starten
              </Button>
            ) : !isRecording ? (
              <>
                <Button 
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Circle className="w-4 h-4 mr-1 fill-current" />
                  Aufnahme
                </Button>
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  className="border-zinc-600"
                  size="sm"
                >
                  <VideoOff className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <Square className="w-4 h-4 mr-1 fill-current" />
                Stopp
              </Button>
            )}
          </div>
          
          {!hasCamera && (
            <p className="text-center text-amber-400 text-xs pb-2">
              Keine Kamera gefunden.
            </p>
          )}
        </div>
      )}
      
      {/* Playback Mode */}
      {recordedVideoUrl && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
          {/* Video Playback */}
          <div className="relative aspect-video bg-zinc-900">
            <video 
              ref={playbackRef}
              src={recordedVideoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              playsInline
              webkit-playsinline="true"
              controls={false}
              preload="metadata"
            />
            {/* Overlay to show video is ready */}
            {duration === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white text-sm">Video wird geladen...</p>
              </div>
            )}
          </div>
          
          {/* Timeline Scrubber - Draggable */}
          <div className="px-4 pt-3">
            <div 
              ref={sliderRef}
              className="relative h-8 flex items-center cursor-pointer touch-none"
              onMouseDown={handleSliderStart}
              onTouchStart={handleSliderStart}
            >
              {/* Track Background */}
              <div className="absolute left-0 right-0 h-2 bg-zinc-700 rounded-full">
                {/* Progress */}
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              
              {/* Slider Thumb */}
              <div 
                className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-transform ${isDragging ? 'scale-125' : 'hover:scale-110'}`}
                style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 12px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Playback Controls - Compact for iPad */}
          <div className="p-2 flex flex-wrap items-center justify-center gap-1">
            <div className="flex items-center gap-1">
              <Button 
                onClick={() => stepFrame(-1)}
                variant="outline"
                size="icon"
                className="border-zinc-600 h-8 w-8"
                title="Ein Frame zurück"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button 
                onClick={togglePlayback}
                className="bg-blue-600 hover:bg-blue-700 h-8 w-8"
                size="icon"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </Button>
              
              <Button 
                onClick={() => stepFrame(1)}
                variant="outline"
                size="icon"
                className="border-zinc-600 h-8 w-8"
                title="Ein Frame vor"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              onClick={captureFrame}
              className="bg-amber-600 hover:bg-amber-700 h-8"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-1" />
              Standbild
            </Button>
            
            {isSaving ? (
              <span className="text-xs text-blue-400 px-2 flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Speichert...
              </span>
            ) : savedVideoId ? (
              <span className="text-xs text-green-400 px-2 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Gespeichert
              </span>
            ) : (
              <Button 
                onClick={saveVideoPermanently}
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/20 h-8"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1" />
                Speichern
              </Button>
            )}
            
            <Button 
              onClick={resetRecording}
              variant="outline"
              className="border-zinc-600 h-8 w-8"
              size="icon"
              title="Neue Aufnahme"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Captured Frames Gallery */}
      {capturedFrames.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-zinc-200">
              Aufgenommene Standbilder ({capturedFrames.length})
            </h3>
            {selectedFrame && (
              <button
                onClick={() => setSelectedFrame(null)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Auswahl aufheben
              </button>
            )}
            {/* Clear All Button */}
            <button
              onClick={() => {
                setCapturedFrames([]);
                setSelectedFrame(null);
                toast.success("Alle Standbilder gelöscht");
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
              Alle löschen
            </button>
          </div>
          
          <p className="text-xs text-zinc-400 mb-3">
            <ArrowUp className="w-3 h-3 inline mr-1" />
            Tippen Sie auf ein Standbild und wählen Sie die Ziel-Phase
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {capturedFrames.map((frame) => (
              <div 
                key={frame.id}
                className={`relative rounded-lg overflow-hidden transition-all ${
                  selectedFrame?.id === frame.id 
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900' 
                    : ''
                }`}
              >
                {/* Frame Image */}
                <div 
                  className="aspect-video bg-zinc-900 cursor-pointer"
                  onClick={() => setSelectedFrame(selectedFrame?.id === frame.id ? null : frame)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(frame));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <img 
                    src={frame.imageUrl} 
                    alt={`Frame at ${frame.timestamp.toFixed(2)}s`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                    <span className="text-[10px] text-white">{frame.timestamp.toFixed(2)}s</span>
                  </div>
                </div>
                
                {/* Assignment Buttons - Show when selected */}
                <AnimatePresence>
                  {selectedFrame?.id === frame.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2"
                    >
                      <span className="text-[10px] text-zinc-300 mb-1">Zuweisen zu:</span>
                      <div className="grid grid-cols-2 gap-1 w-full">
                        {PHASES.map((phase) => (
                          <button
                            key={phase.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignToPhase(phase.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-2 px-1 rounded font-medium transition-colors"
                          >
                            {phase.short}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFrame(frame.id);
                          setSelectedFrame(null);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] py-1.5 rounded flex items-center justify-center gap-1 mt-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Löschen
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
          {/* Quick Assign Legend */}
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
              <span className="font-medium text-zinc-400">Phasen:</span>
              {PHASES.map((phase) => (
                <span key={phase.id}>{phase.short} = {phase.title}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  { id: 1, title: "1. Angleiten", short: "1" },
  { id: 2, title: "2. Stoßauslage", short: "2" },
  { id: 3, title: "3. Dreh-Streck", short: "3" },
  { id: 4, title: "4. Abstoß", short: "4" },
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
  const captureFrame = () => {
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
  };

  // Delete a captured frame
  const deleteFrame = (frameId) => {
    setCapturedFrames(prev => prev.filter(f => f.id !== frameId));
    if (onDeleteFrame) {
      onDeleteFrame(frameId);
    }
  };

  // Save video permanently
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
    <div className="space-y-4">
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
          <div className="p-4 flex items-center justify-center gap-3">
            {!isStreaming ? (
              <Button 
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!hasCamera}
              >
                <Video className="w-4 h-4 mr-2" />
                Kamera starten
              </Button>
            ) : !isRecording ? (
              <>
                <Button 
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Circle className="w-4 h-4 mr-2 fill-current" />
                  Aufnahme starten
                </Button>
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  className="border-zinc-600"
                >
                  <VideoOff className="w-4 h-4 mr-2" />
                  Kamera stoppen
                </Button>
              </>
            ) : (
              <Button 
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="w-4 h-4 mr-2 fill-current" />
                Aufnahme beenden
              </Button>
            )}
          </div>
          
          {!hasCamera && (
            <p className="text-center text-amber-400 text-sm pb-4">
              Keine Kamera gefunden oder Zugriff verweigert.
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
            />
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
          
          {/* Playback Controls */}
          <div className="p-4 flex items-center justify-center gap-2">
            <Button 
              onClick={() => stepFrame(-1)}
              variant="outline"
              size="icon"
              className="border-zinc-600"
              title="Ein Frame zurück"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={togglePlayback}
              className="bg-blue-600 hover:bg-blue-700"
              size="icon"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            
            <Button 
              onClick={() => stepFrame(1)}
              variant="outline"
              size="icon"
              className="border-zinc-600"
              title="Ein Frame vor"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-zinc-600 mx-2" />
            
            <Button 
              onClick={captureFrame}
              className="bg-amber-600 hover:bg-amber-700"
              title="Standbild aufnehmen"
            >
              <Camera className="w-4 h-4 mr-2" />
              Standbild
            </Button>
            
            <div className="w-px h-6 bg-zinc-600 mx-2" />
            
            <Button 
              onClick={saveVideoPermanently}
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-600/20"
              title="Video dauerhaft speichern"
            >
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
            
            <Button 
              onClick={resetRecording}
              variant="outline"
              className="border-zinc-600"
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
          <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-zinc-200 mb-3">
            Aufgenommene Standbilder ({capturedFrames.length})
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            Ziehen Sie ein Standbild in eines der Phasen-Fenster oben
          </p>
          
          <div className="grid grid-cols-4 gap-2">
            {capturedFrames.map((frame) => (
              <div 
                key={frame.id}
                className="relative group aspect-video bg-zinc-900 rounded-lg overflow-hidden cursor-grab"
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
                <button
                  onClick={() => deleteFrame(frame.id)}
                  className="absolute top-1 right-1 p-1 bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Standbild löschen"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

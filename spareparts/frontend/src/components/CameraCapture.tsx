import React, { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
  onError: (error: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onError('Unable to access camera. Please check permissions.');
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          onImageCapture(file);
        }
        setIsCapturing(false);
      }, 'image/jpeg', 0.8);
    }
  }, [onImageCapture, isCapturing]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageCapture(file);
    } else {
      onError('Please select a valid image file.');
    }
  };

  return (
    <div className="camera-capture">
      <div className="camera-container">
        {!isStreaming ? (
          <div className="camera-placeholder">
            <div className="camera-icon">📷</div>
            <p>Camera not active</p>
            <button 
              onClick={startCamera}
              className="btn btn-primary"
            >
              Start Camera
            </button>
          </div>
        ) : (
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            <div className="camera-controls">
              <button
                onClick={captureImage}
                disabled={isCapturing}
                className="btn btn-capture"
              >
                {isCapturing ? 'Capturing...' : '📸 Capture'}
              </button>
              <button
                onClick={stopCamera}
                className="btn btn-secondary"
              >
                Stop Camera
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="upload-section">
        <p>Or upload an image:</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="file-input"
        />
      </div>

      <style jsx>{`
        .camera-capture {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .camera-container {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 1rem;
          background: #f9f9f9;
        }

        .camera-placeholder {
          text-align: center;
          padding: 2rem;
        }

        .camera-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .video-container {
          position: relative;
        }

        .camera-video {
          width: 100%;
          max-width: 100%;
          border-radius: 8px;
        }

        .camera-controls {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: center;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-capture {
          background: #28a745;
          color: white;
          font-size: 1.2rem;
        }

        .btn-capture:hover {
          background: #1e7e34;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-section {
          text-align: center;
          padding: 1rem;
          border-top: 1px solid #eee;
        }

        .file-input {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CameraCapture; 
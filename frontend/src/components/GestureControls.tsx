import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Smile, Eye, Frown } from "lucide-react";

interface GestureControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const GestureControls: React.FC<GestureControlsProps> = ({
  onPlay,
  onPause,
  onNext,
  isEnabled,
  onToggle,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [lastSmileTime, setLastSmileTime] = useState(0);
  const [lastFrownTime, setLastFrownTime] = useState(0);
  const blinkCooldown = 1000; // 1 second between blinks
  const smileCooldown = 2000; // 2 seconds between smile actions
  const frownCooldown = 2000; // 2 seconds between frown actions

  useEffect(() => {
    if (!isEnabled || isInitialized) return;

    const initializeMediaPipe = async () => {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.save();
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(
              results.image,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
            ctx.restore();

            // Detect gestures
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const landmarks = results.multiFaceLandmarks[0];
              detectGestures(landmarks);
            }
          }
        }
      });

      faceMeshRef.current = faceMesh;

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
        cameraRef.current = camera;
      }

      setIsInitialized(true);
    };

    initializeMediaPipe();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [isEnabled, isInitialized]);

  const detectGestures = (landmarks: any[]) => {
    if (landmarks.length < 468) return; // Face mesh has 468 landmarks

    // Mouth landmarks (approximate indices for mouth corners and center)
    // Left mouth corner: 61, Right mouth corner: 291, Upper lip center: 13, Lower lip center: 14
    const leftMouthX = landmarks[61].x;
    const rightMouthX = landmarks[291].x;
    const upperLipY = landmarks[13].y;
    const lowerLipY = landmarks[14].y;
    const mouthWidth = Math.abs(rightMouthX - leftMouthX);
    const mouthHeight = Math.abs(upperLipY - lowerLipY);

    // Smile detection: wide mouth with corners up
    const smileRatio = mouthWidth / mouthHeight;
    const isSmiling = smileRatio > 2.5 && upperLipY < lowerLipY;

    // Frown detection: corners down
    const leftMouthY = landmarks[61].y;
    const rightMouthY = landmarks[291].y;
    const centerMouthY = (upperLipY + lowerLipY) / 2;
    const isFrowning =
      leftMouthY > centerMouthY + 0.02 && rightMouthY > centerMouthY + 0.02;

    // Blink detection: eye landmarks (left eye: 33-46, right eye: 263-276)
    const leftEyeTop = landmarks[159].y; // Upper eyelid
    const leftEyeBottom = landmarks[145].y; // Lower eyelid
    const rightEyeTop = landmarks[386].y;
    const rightEyeBottom = landmarks[374].y;

    const leftEyeOpen = Math.abs(leftEyeTop - leftEyeBottom);
    const rightEyeOpen = Math.abs(rightEyeTop - rightEyeBottom);
    const isBlinking = leftEyeOpen < 0.015 && rightEyeOpen < 0.015;

    const now = Date.now();

    // Handle smile (play)
    if (isSmiling && now - lastSmileTime > smileCooldown) {
      setLastSmileTime(now);
      onPlay();
    }

    // Handle frown (pause)
    if (isFrowning && now - lastFrownTime > frownCooldown) {
      setLastFrownTime(now);
      onPause();
    }

    // Handle blink (next track)
    if (isBlinking && now - lastBlinkTime > blinkCooldown) {
      setLastBlinkTime(now);
      onNext();
    }
  };

  if (!isEnabled) {
    return (
      <div className="panel p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Gesture Controls</h3>
            <p className="text-sm text-gray-400">
              Use facial gestures to control playback
            </p>
          </div>
          <button
            onClick={() => onToggle(true)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-medium transition-colors"
          >
            Enable
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold mb-1">Gesture Controls Active</h3>
          <p className="text-sm text-gray-400">
            Smile = Play • Blink = Next • Frown = Pause
          </p>
        </div>
        <button
          onClick={() => onToggle(false)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
        >
          Disable
        </button>
      </div>

      <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={640}
          height={480}
        />
      </div>

      <div className="flex gap-4 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Smile className="w-4 h-4" />
          <span>Smile to Play</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>Blink to Next</span>
        </div>
        <div className="flex items-center gap-1">
          <Frown className="w-4 h-4" />
          <span>Frown to Pause</span>
        </div>
      </div>
    </div>
  );
};

export default GestureControls;


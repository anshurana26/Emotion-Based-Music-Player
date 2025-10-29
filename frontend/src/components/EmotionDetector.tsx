import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { EmotionDetectionResult, Emotion } from "../types";
import { Music, AlertCircle } from "lucide-react";

interface EmotionDetectorProps {
  onEmotionDetected: (result: EmotionDetectionResult) => void;
  isActive: boolean;
  lastEmotion: Emotion;
}

const EmotionDetector: React.FC<EmotionDetectorProps> = ({
  onEmotionDetected,
  isActive,
  lastEmotion,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const detectionActiveRef = useRef(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Specify the models path
        const MODEL_URL = "/models";

        // Load required face-api models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        setIsModelLoaded(true);
        setIsInitializing(false);
      } catch (error) {
        console.error("Error loading models:", error);
        setPermissionError(
          "Failed to load facial recognition models. Please refresh and try again."
        );
        setIsInitializing(false);
      }
    };

    loadModels();
  }, []);

  // Set up webcam and detection
  useEffect(() => {
    if (!isModelLoaded || !isActive) return;

    let stream: MediaStream | null = null;

    const startVideo = async () => {
      try {
        // Request user permission for webcam access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        // Set the stream as the video source
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setPermissionError(null);
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setPermissionError(
          "Unable to access your camera. Please grant permission and refresh."
        );
      }
    };

    startVideo();

    // Clean up function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isModelLoaded, isActive]);

  // Perform emotion detection
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current || permissionError) {
      return;
    }

    // If camera is inactive, stop detection
    if (!isActive) {
      detectionActiveRef.current = false;
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    let animationFrameId: number;

    // Maps face-api expressions to our emotion types
    const expressionToEmotion = (
      expressions: faceapi.FaceExpressions
    ): { emotion: Emotion; confidence: number } => {
      const highest = Object.entries(expressions).reduce((prev, current) => {
        return prev[1] > current[1] ? prev : current;
      });

      // Map face-api expression names to our emotion types
      switch (highest[0]) {
        case "happy":
          return { emotion: "happy", confidence: highest[1] };
        case "sad":
          return { emotion: "sad", confidence: highest[1] };
        case "angry":
          return { emotion: "angry", confidence: highest[1] };
        case "surprised":
          return { emotion: "surprised", confidence: highest[1] };
        case "neutral":
        default:
          return { emotion: "neutral", confidence: highest[1] };
      }
    };

    const detectEmotions = async () => {
      // Stop if detection is no longer active
      if (!detectionActiveRef.current) {
        return;
      }

      if (video.readyState === 4) {
        // 4 = HAVE_ENOUGH_DATA
        // Get video dimensions
        const { videoWidth, videoHeight } = video;

        // Set canvas dimensions to match video
        if (canvas) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;

          // Detect faces and expressions
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          // Clear canvas
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw detections and process results
          if (detections.length > 0) {
            // Get the face with highest confidence
            const primaryFace = detections[0];
            const result = expressionToEmotion(primaryFace.expressions);

            // Only report if confidence is high enough
            if (result.confidence > 0.5) {
              // Stop detection after reporting
              detectionActiveRef.current = false;
              onEmotionDetected(result);
              return;
            }

            // Draw the face detection results on canvas
            faceapi.draw.drawDetections(canvas, detections);
          }
        }
      }

      // Continue detection loop only if still active
      if (detectionActiveRef.current) {
        animationFrameId = requestAnimationFrame(detectEmotions);
      }
    };

    // Start the detection loop
    video.onplay = () => {
      detectionActiveRef.current = true;
      detectEmotions();
    };

    // Clean up function
    return () => {
      detectionActiveRef.current = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [isModelLoaded, isActive, permissionError, onEmotionDetected]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-48 md:h-64 lg:h-80 bg-gray-800 rounded-xl p-4">
        <Music className="w-12 h-12 text-white animate-pulse mb-4" />
        <p className="text-white text-center">
          Initializing emotion detection...
        </p>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 md:h-64 lg:h-80 bg-gray-800 rounded-xl p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white text-center">{permissionError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full rounded-xl object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full rounded-xl"
      />
      {!isActive && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-xl">
          <p className="text-white text-lg">Webcam paused</p>
        </div>
      )}
    </div>
  );
};

export default EmotionDetector;

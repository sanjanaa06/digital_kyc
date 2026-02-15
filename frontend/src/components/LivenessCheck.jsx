import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

/**
 * LivenessCheck (NO BLINK)
 * - Face detection
 * - Turn LEFT
 * - Turn RIGHT
 * - Auto capture selfie after both turns
 *
 * Output:
 * onCapture(file) -> returns selfie image file after liveness passed
 */
export default function LivenessCheck({ onCapture }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("Initializing camera...");
  const [facePresent, setFacePresent] = useState(false);

  const [turnedLeft, setTurnedLeft] = useState(false);
  const [turnedRight, setTurnedRight] = useState(false);

  const [passed, setPassed] = useState(false);
  const [captured, setCaptured] = useState(false);

  const draw = (landmarks) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const video = webcamRef.current?.video;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw nose tip point (for debug)
    const nose = landmarks[1];
    ctx.beginPath();
    ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "lime";
    ctx.fill();
  };

  const captureSelfie = () => {
    if (captured) return;

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const arr = imageSrc.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) u8arr[n] = bstr.charCodeAt(n);

    const file = new File([u8arr], "live_selfie.png", { type: mime });

    setCaptured(true);
    onCapture?.(file);
  };

  useEffect(() => {
    let camera = null;
    let faceMesh = null;
    let interval = null;

    const start = async () => {
      setStatus("Loading face model...");

      faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://unpkg.com/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      faceMesh.onResults((results) => {
        const video = webcamRef.current?.video;
        if (!video) return;

        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
          setFacePresent(false);
          setStatus("No face detected. Please align your face.");
          return;
        }

        setFacePresent(true);

        const landmarks = results.multiFaceLandmarks[0];
        draw(landmarks);

        // --- Head turn detection ---
        // landmarks: 234 left cheek, 454 right cheek, 1 nose
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const nose = landmarks[1];

        const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
        const centerX = (leftCheek.x + rightCheek.x) / 2;
        const noseOffset = (nose.x - centerX) / faceWidth;

        // noseOffset negative => turn left, positive => turn right
        if (noseOffset < -0.12) setTurnedLeft(true);
        if (noseOffset > 0.12) setTurnedRight(true);

        // --- Challenge status ---
        if (!turnedLeft) {
          setStatus("Challenge: Turn your head LEFT");
          return;
        }

        if (!turnedRight) {
          setStatus("Challenge: Turn your head RIGHT");
          return;
        }

        setStatus("Liveness Passed ✅ Capturing selfie...");
        setPassed(true);

        setTimeout(() => captureSelfie(), 400);
      });

      setStatus("Waiting for webcam...");

      // Wait until webcam is ready
      interval = setInterval(() => {
        const video = webcamRef.current?.video;

        if (video && video.readyState === 4) {
          clearInterval(interval);

          setStatus("Starting camera...");

          camera = new Camera(video, {
            onFrame: async () => {
              await faceMesh.send({ image: video });
            },
            width: 640,
            height: 480,
          });

          camera.start();
        }
      }, 300);
    };

    start();

    return () => {
      try {
        if (interval) clearInterval(interval);
        camera?.stop();
      } catch (e) {}
    };
  }, [turnedLeft, turnedRight, captured]);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "14px",
        marginTop: "12px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Live Selfie (Liveness Check)</h3>

      <p style={{ marginTop: "6px", color: facePresent ? "#111" : "#b00020" }}>
        {status}
      </p>

      <div style={{ position: "relative", width: "100%", maxWidth: "520px" }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/png"
          mirrored={true}
          style={{
            width: "100%",
            borderRadius: "12px",
            border: passed ? "2px solid green" : "2px solid #eee",
          }}
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user",
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <Badge label="Left Turn" ok={turnedLeft} />
        <Badge label="Right Turn" ok={turnedRight} />
        <Badge label="Captured" ok={captured} />
      </div>

      <button
        type="button"
        onClick={() => captureSelfie()}
        style={{
          marginTop: "12px",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          cursor: "pointer",
          width: "fit-content",
        }}
      >
        Capture Selfie Manually
      </button>

      <p style={{ marginTop: "10px", fontSize: "13px", color: "#666" }}>
        Tip: Slowly turn your head left and right for live verification.
      </p>
    </div>
  );
}

function Badge({ label, ok }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: "999px",
        border: "1px solid #ddd",
        background: ok ? "#e8ffe8" : "#f6f6f6",
        fontSize: "13px",
      }}
    >
      {ok ? "✅ " : "⬜ "} {label}
    </span>
  );
}

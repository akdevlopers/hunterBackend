"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Camera, QrCode, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function POSCameraScannerModal({ isOpen, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const [supportedDetector, setSupportedDetector] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      setSupportedDetector(true);
    }
  }, []);

  // Start Camera Stream
  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!isOpen) return;

      setErrorMessage("");
      setLastScanned("");
      setIsScanning(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
        }

        // Start scanning frames if BarcodeDetector is available
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: [
              "qr_code",
              "ean_13",
              "ean_8",
              "code_128",
              "code_39",
              "code_93",
              "upc_a",
              "upc_e",
              "data_matrix",
            ],
          });

          const scanFrame = async () => {
            if (!active || !videoRef.current) return;

            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawVal = barcodes[0].rawValue;
                  if (rawVal && rawVal !== lastScanned) {
                    setLastScanned(rawVal);
                    onScanSuccess(rawVal);
                    // Add slight delay to prevent instant multi-triggers
                    await new Promise((r) => setTimeout(r, 1200));
                  }
                }
              } catch (err) {
                // Ignore detection frame errors
              }
            }

            if (active) {
              animationFrameRef.current = requestAnimationFrame(scanFrame);
            }
          };

          animationFrameRef.current = requestAnimationFrame(scanFrame);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setHasCamera(false);
        setErrorMessage(
          err.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow camera access in your browser settings."
            : "Could not access camera device or camera is currently in use by another application."
        );
      }
    }

    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [isOpen, onScanSuccess, lastScanned]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
    setManualCode("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Scan QR Code / Barcode"
      description="Point your camera at a product QR code or Barcode tag to add it to the bill"
      size="md"
    >
      <div className="space-y-4">
        {/* Camera Viewport */}
        <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Scanner Targeting Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-56 h-56 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Laser scan line animation */}
              <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-bounce top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Feedback Overlay when detected */}
          {lastScanned && (
            <div className="absolute bottom-3 inset-x-4 bg-emerald-900/90 backdrop-blur-sm border border-emerald-500/50 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Scanned: {lastScanned}</span>
            </div>
          )}

          {/* Error / No Permission Banner */}
          {errorMessage && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs p-6 flex flex-col items-center justify-center text-center text-white space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-xs text-slate-300 max-w-xs">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Manual SKU fallback or hardware scanner input */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Or type / paste SKU code directly:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. SKU12345 or Barcode"
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button type="submit" variant="primary" size="sm">
              Add Item
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            Hardware & USB scanners also work automatically
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

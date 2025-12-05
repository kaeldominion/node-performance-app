'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Icons } from '@/lib/iconMapping';

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      if (!scannerContainerRef.current) {
        setError('Scanner container not found');
        return;
      }

      const scannerId = 'qr-scanner-container';
      scannerContainerRef.current.id = scannerId;

      // Create Html5Qrcode instance
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      // Start scanning
      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // Scanning area
        },
        (decodedText) => {
          // QR code detected
          stopScanning();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Error during scanning (usually just means no QR code found yet)
          // Don't show these errors as they're expected during scanning
        }
      );

      setHasPermission(true);
      setIsScanning(true);
    } catch (err: any) {
      setHasPermission(false);
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access to scan QR codes.'
        : err.name === 'NotFoundError'
        ? 'No camera found. Please use a device with a camera.'
        : err.message || 'Failed to access camera. Please try again.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        // Ignore errors when stopping
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const code = prompt('Enter network code manually (e.g., NT...):');
    if (code && code.trim()) {
      onScan(code.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      {!hasPermission && !isScanning && (
        <div className="text-center space-y-4">
          <p className="text-muted-text">
            Scan a QR code to add someone to your network
          </p>
          <button
            onClick={startScanning}
            className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Camera
          </button>
          <div>
            <button
              onClick={handleManualInput}
              className="text-node-volt hover:underline text-sm"
            >
              Or enter code manually
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
          <div className="mt-2">
            <button
              onClick={handleManualInput}
              className="text-red-400 hover:underline"
            >
              Enter code manually instead
            </button>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
            <div ref={scannerContainerRef} className="w-full h-full" />
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-node-volt rounded-lg w-64 h-64">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-node-volt"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-node-volt"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-node-volt"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-node-volt"></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={stopScanning}
              className="flex-1 bg-dark thin-border text-text-white font-bold px-4 py-2 rounded-lg hover:bg-concrete-grey transition-colors"
            >
              Stop Scanning
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-muted-text hover:text-text-white"
              >
                <Icons.X size={20} />
              </button>
            )}
          </div>
          <p className="text-xs text-center text-muted-text">
            Position the QR code within the frame
          </p>
        </div>
      )}
    </div>
  );
}

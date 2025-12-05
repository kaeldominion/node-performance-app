'use client';

import { useState, useEffect } from 'react';
import { networkApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
  ssr: false,
});

interface ShowQRCodeModalProps {
  onClose: () => void;
  currentUserNetworkCode?: string;
}

export function ShowQRCodeModal({ onClose, currentUserNetworkCode }: ShowQRCodeModalProps) {
  const [networkCode, setNetworkCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    if (currentUserNetworkCode) {
      setNetworkCode(currentUserNetworkCode);
    } else {
      generateNetworkCode();
    }
  }, [currentUserNetworkCode]);

  const generateNetworkCode = async () => {
    try {
      setIsGeneratingCode(true);
      const result = await networkApi.generateCode();
      setNetworkCode(result.networkCode);
    } catch (error) {
      console.error('Failed to generate network code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            My Network Code
          </h2>
          <button onClick={onClose} className="text-muted-text hover:text-text-white">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="text-center">
          {networkCode ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={networkCode} size={200} />
              </div>
              <div className="bg-dark thin-border rounded-lg p-4 w-full">
                <div className="text-sm text-muted-text mb-1">Your Network Code</div>
                <div className="text-2xl font-bold text-node-volt font-mono">{networkCode}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(networkCode);
                  alert('Network code copied to clipboard!');
                }}
                className="text-node-volt hover:underline text-sm font-medium"
              >
                Copy Code
              </button>
              <p className="text-xs text-muted-text mt-2">
                Share this QR code or code with others to connect in your network
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              {isGeneratingCode ? (
                <div className="text-muted-text">Generating code...</div>
              ) : (
                <button
                  onClick={generateNetworkCode}
                  className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Generate Network Code
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


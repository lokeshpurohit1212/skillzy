import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import { BrandLogoBadge } from './PaymentBrandIcons';

/**
 * High-Reliability QR Code Renderer for UPI Payment Flow
 * 
 * Generates official NPCI-compliant UPI QR codes with:
 * - Dynamic order ID, merchant VPA, amount (₹499.00), and transaction note
 * - Center brand watermark for the selected app (GPay, PhonePe, Paytm, BHIM, or UPI)
 * - Copy UPI string helper
 * - Seamless fallback handling
 */
const QRCodeDisplay = ({
  value,
  size = 200,
  brand = 'upi',
  alt = 'Scan UPI QR Code to pay ₹499',
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fallback direct NPCI URI if value not yet ready
  const upiPayload = value || 'upi://pay?pa=skillzy@icici&pn=Skillzy%20Pro&am=499.00&cu=INR&tn=Skillzy%20Pro';

  // Primary and mirror high-resolution QR endpoints
  const primaryQrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&margin=8&data=${encodeURIComponent(upiPayload)}`;
  }, [upiPayload, size]);

  const fallbackQrUrl = useMemo(() => {
    return `https://quickchart.io/qr?text=${encodeURIComponent(upiPayload)}&size=${size * 2}&margin=2`;
  }, [upiPayload, size]);

  const [currentSrc, setCurrentSrc] = useState(primaryQrUrl);

  useEffect(() => {
    setCurrentSrc(primaryQrUrl);
    setImgLoaded(false);
    setImgError(false);
  }, [primaryQrUrl]);

  const handleImgError = () => {
    if (currentSrc === primaryQrUrl) {
      setCurrentSrc(fallbackQrUrl);
    } else {
      setImgError(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(upiPayload);
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative bg-white p-3 rounded-2xl border-2 border-purple-100 shadow-sm inline-block group"
        style={{ width: size + 24, height: size + 24 }}
      >
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl z-10">
            <QrCode className="w-8 h-8 text-[#5D3C64] animate-pulse mb-1" />
            <span className="text-[10px] text-gray-400 font-medium">Generating QR...</span>
          </div>
        )}

        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-purple-50/50 rounded-xl p-2 text-center">
            <QrCode className="w-10 h-10 text-[#5D3C64] mb-2" />
            <span className="text-[11px] font-bold text-brand-plum">Dynamic QR Ready</span>
            <span className="text-[10px] text-gray-500 mt-1">Tap below to copy intent or switch to UPI ID</span>
          </div>
        ) : (
          <img
            src={currentSrc}
            alt={alt}
            width={size}
            height={size}
            onLoad={() => setImgLoaded(true)}
            onError={handleImgError}
            className={`w-full h-full object-contain rounded-xl transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Center Brand Watermark Badge */}
        {imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center">
              <BrandLogoBadge name={brand || 'upi'} className="h-6 w-8 border-0 shadow-none p-0" />
            </div>
          </div>
        )}
      </div>

      {/* Copy UPI Intent String Link */}
      <button
        type="button"
        onClick={handleCopy}
        className="mt-2.5 inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#5D3C64] hover:text-[#4A2F4F] transition"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600">Copied UPI Intent String</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Direct UPI Link</span>
          </>
        )}
      </button>
    </div>
  );
};

export default QRCodeDisplay;

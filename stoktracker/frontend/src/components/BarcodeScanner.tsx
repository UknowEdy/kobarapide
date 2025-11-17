import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import Button from './Button';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'barcode-scanner';

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError(null);
      setScanning(true);

      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Caméra arrière
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Code scanné avec succès
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        (errorMessage) => {
          // Erreur de scan (ignorée car normale pendant le scan)
        }
      );
    } catch (err: any) {
      console.error('Erreur du scanner:', err);
      setError(
        'Impossible d\'accéder à la caméra. Vérifiez les permissions.'
      );
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Erreur lors de l\'arrêt du scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold">Scanner un code-barres</h2>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {error ? (
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-medium">Erreur</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <Button onClick={handleClose} variant="secondary">
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <div
              id={elementId}
              className="w-full max-w-md rounded-lg overflow-hidden"
            />

            <div className="mt-6 text-center text-white">
              <p className="text-sm">
                Positionnez le code-barres dans le cadre
              </p>
              {scanning && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Scan en cours...</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button onClick={handleClose} variant="secondary">
                Annuler
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;

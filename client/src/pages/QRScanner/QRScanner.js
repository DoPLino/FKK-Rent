import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  QrCodeIcon,
  CameraIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { QrScanner } from 'react-qr-scanner';
import { equipmentService } from '../../services/equipmentService';
import { toast } from 'react-hot-toast';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [equipment, setEquipment] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    // Load scan history from localStorage
    const history = localStorage.getItem('scanHistory');
    if (history) {
      setScanHistory(JSON.parse(history));
    }
  }, []);

  const handleScan = async (data) => {
    if (data && !result) {
      setResult(data);
      setScanning(false);
      await processScanResult(data);
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setError('Failed to access camera. Please check permissions and try again.');
    setScanning(false);
  };

  const processScanResult = async (scanData) => {
    setLoading(true);
    try {
      // Try to find equipment by QR code
      const response = await equipmentService.getEquipmentByQR(scanData);
      
      if (response.success) {
        setEquipment(response.data);
        toast.success('Equipment found!');
        
        // Add to scan history
        const newHistory = [
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            data: scanData,
            equipment: response.data.name,
            success: true
          },
          ...scanHistory.slice(0, 9) // Keep last 10 scans
        ];
        setScanHistory(newHistory);
        localStorage.setItem('scanHistory', JSON.stringify(newHistory));
      } else {
        toast.error('Equipment not found for this QR code');
        setEquipment(null);
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      toast.error('Failed to process QR code');
      setEquipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      await processScanResult(manualInput.trim());
      setShowManualInput(false);
      setManualInput('');
    }
  };

  const resetScanner = () => {
    setResult(null);
    setError(null);
    setEquipment(null);
    setScanning(true);
    setShowManualInput(false);
    setManualInput('');
  };

  const navigateToEquipment = () => {
    if (equipment) {
      navigate(`/equipment/${equipment.id}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              QR Scanner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Scan equipment QR codes for quick access
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="btn-outline"
          >
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            Manual Input
          </button>
          <button
            onClick={resetScanner}
            className="btn-primary"
          >
            <QrCodeIcon className="w-4 h-4 mr-2" />
            New Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Manual Input */}
          {showManualInput && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manual QR Code Input
                </h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="manual-input" className="form-label">
                      Enter QR Code Data
                    </label>
                    <input
                      type="text"
                      id="manual-input"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="form-input"
                      placeholder="Paste or type QR code data here"
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Process
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualInput(false)}
                      className="btn-outline"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Scanner */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Camera Scanner
              </h2>
            </div>
            <div className="card-body">
              {scanning && !error ? (
                <div className="relative">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <QrScanner
                      ref={videoRef}
                      onDecode={handleScan}
                      onError={handleError}
                      constraints={{
                        video: {
                          facingMode: 'environment'
                        }
                      }}
                      className="w-full h-full"
                    />
                  </div>
                  
                  {/* Scanner Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="flex items-center justify-center h-full">
                      <div className="relative">
                        {/* Corner Markers */}
                        <div className="w-64 h-64 border-2 border-primary-500 relative">
                          {/* Top-left corner */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary-500"></div>
                          {/* Top-right corner */}
                          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary-500"></div>
                          {/* Bottom-left corner */}
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary-500"></div>
                          {/* Bottom-right corner */}
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary-500"></div>
                        </div>
                        
                        {/* Scanning Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Position the QR code within the frame
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-16 h-16 text-danger-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Camera Error
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={resetScanner}
                      className="btn-primary"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                    <button
                      onClick={() => setShowManualInput(true)}
                      className="btn-outline block mx-auto"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                      Manual Input
                    </button>
                  </div>
                </div>
              ) : result ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-16 h-16 text-success-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    QR Code Scanned Successfully!
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scanned Data:</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                      {result}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result)}
                    className="btn-outline btn-sm"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Equipment Result */}
          {equipment && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Equipment Found
                </h2>
              </div>
              <div className="card-body">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <QrCodeIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {equipment.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {equipment.description || 'No description available'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Location: {equipment.location || 'Unknown'}
                      </span>
                      <span className={`status-badge ${
                        equipment.status === 'available' ? 'status-available' : 'status-checked-out'
                      }`}>
                        {equipment.status === 'available' ? 'Available' : 'In Use'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={navigateToEquipment}
                    className="btn-primary"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </div>
            <div className="card-body space-y-3">
              <button
                onClick={() => setShowManualInput(true)}
                className="btn-outline w-full"
              >
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Manual Input
              </button>
              <button
                onClick={resetScanner}
                className="btn-outline w-full"
              >
                <QrCodeIcon className="w-4 h-4 mr-2" />
                New Scan
              </button>
              <Link
                to="/equipment"
                className="btn-outline w-full text-center"
              >
                Browse Equipment
              </Link>
            </div>
          </div>

          {/* Scan History */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Scans
              </h3>
            </div>
            <div className="card-body">
              {scanHistory.length > 0 ? (
                <div className="space-y-3">
                  {scanHistory.slice(0, 5).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        scan.success ? 'bg-success-500' : 'bg-danger-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {scan.equipment || 'Unknown Equipment'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(scan.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <QrCodeIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent scans
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-blue-50 dark:bg-blue-900">
            <div className="card-body">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Scanning Tips
                  </h4>
                  <ul className="mt-2 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Ensure good lighting</li>
                    <li>• Hold device steady</li>
                    <li>• Keep QR code in frame</li>
                    <li>• Use manual input if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
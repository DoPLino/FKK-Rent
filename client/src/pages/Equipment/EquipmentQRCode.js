import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { equipmentService } from '../../services/equipmentService';
import { toast } from 'react-hot-toast';

const EquipmentQRCode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [equipment, setEquipment] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [qrSize, setQrSize] = useState('medium');
  const [includeInfo, setIncludeInfo] = useState(true);

  useEffect(() => {
    loadEquipmentData();
  }, [id]);

  const loadEquipmentData = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getEquipmentById(id);
      
      if (response.success) {
        setEquipment(response.data);
        
        // Generate QR code data
        const qrData = {
          id: response.data.id,
          name: response.data.name,
          serialNumber: response.data.serialNumber,
          category: response.data.category,
          location: response.data.location,
          timestamp: new Date().toISOString()
        };
        
        setQrCodeData(qrData);
      } else {
        toast.error('Equipment not found');
        navigate('/equipment');
      }
    } catch (error) {
      toast.error('Failed to load equipment data');
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setGenerating(true);
      const response = await equipmentService.generateQRCode(id);
      
      if (response.success) {
        setQrCodeData(response.data);
        toast.success('QR code generated successfully');
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch (error) {
      toast.error('Failed to generate QR code');
      console.error('Error generating QR code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = async (format = 'png') => {
    try {
      const response = await equipmentService.generateQRCode(id, { format, size: qrSize });
      
      if (response.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = `${equipment.name.replace(/\s+/g, '_')}_QR.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`QR code downloaded as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to download QR code');
      }
    } catch (error) {
      toast.error('Failed to download QR code');
      console.error('Error downloading QR code:', error);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${equipment?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .qr-container { text-align: center; }
            .qr-info { margin: 20px 0; }
            .qr-code { margin: 20px 0; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>Equipment QR Code</h2>
            <div class="qr-info">
              <p><strong>Name:</strong> ${equipment?.name}</p>
              <p><strong>Serial Number:</strong> ${equipment?.serialNumber}</p>
              <p><strong>Category:</strong> ${equipment?.category}</p>
              <p><strong>Location:</strong> ${equipment?.location}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="qr-code">
              <img src="${qrCodeData?.qrImageUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='}" alt="QR Code" style="max-width: 300px;" />
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const copyQRData = () => {
    if (qrCodeData) {
      navigator.clipboard.writeText(JSON.stringify(qrCodeData, null, 2));
      toast.success('QR data copied to clipboard');
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && qrCodeData?.qrImageUrl) {
      try {
        await navigator.share({
          title: `QR Code - ${equipment?.name}`,
          text: `QR Code for ${equipment?.name}`,
          url: qrCodeData.qrImageUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyQRData();
    }
  };

  const getQRSizeClass = () => {
    const sizeClasses = {
      small: 'w-32 h-32',
      medium: 'w-48 h-48',
      large: 'w-64 h-64'
    };
    return sizeClasses[qrSize] || sizeClasses.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Equipment Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The equipment you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/equipment')}
          className="btn-primary"
        >
          Back to Equipment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/equipment/${id}`)}
            className="btn-outline"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Equipment
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              QR Code Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and manage QR codes for {equipment.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Code Display */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  QR Code
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="btn-outline"
                  >
                    {showQR ? (
                      <>
                        <EyeSlashIcon className="w-4 h-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={generateQRCode}
                    disabled={generating}
                    className="btn-primary"
                  >
                    {generating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <QrCodeIcon className="w-4 h-4 mr-2" />
                    )}
                    {generating ? 'Generating...' : 'Generate New'}
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {showQR && qrCodeData ? (
                <div className="text-center">
                  <div className={`${getQRSizeClass()} mx-auto bg-white p-4 rounded-lg shadow-lg`}>
                    <img
                      src={qrCodeData.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrCodeData))}`}
                      alt="QR Code"
                      className="w-full h-full"
                    />
                  </div>
                  
                  {includeInfo && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Equipment Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Name:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {equipment.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Serial:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {equipment.serialNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Category:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {equipment.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Location:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {equipment.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {showQR ? 'No QR code generated yet' : 'QR code is hidden'}
                  </p>
                  {!showQR && (
                    <button
                      onClick={() => setShowQR(true)}
                      className="btn-primary mt-4"
                    >
                      Show QR Code
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* QR Code Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export & Share
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => downloadQRCode('png')}
                  className="btn-outline"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download PNG
                </button>
                <button
                  onClick={() => downloadQRCode('svg')}
                  className="btn-outline"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download SVG
                </button>
                <button
                  onClick={printQRCode}
                  className="btn-outline"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={shareQRCode}
                  className="btn-outline"
                >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Data */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  QR Code Data
                </h2>
                <button
                  onClick={copyQRData}
                  className="btn-outline"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Copy Data
                </button>
              </div>
            </div>
            <div className="card-body">
              <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto">
                <code className="text-gray-900 dark:text-white">
                  {qrCodeData ? JSON.stringify(qrCodeData, null, 2) : 'No QR code data available'}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Equipment Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Equipment Details
              </h3>
            </div>
            <div className="card-body space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {equipment.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Serial Number</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {equipment.serialNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {equipment.category}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {equipment.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`status-badge ${
                  equipment.status === 'available' ? 'status-available' :
                  equipment.status === 'booked' ? 'status-checked-out' :
                  equipment.status === 'maintenance' ? 'status-maintenance' :
                  'status-damaged'
                }`}>
                  {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* QR Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Settings
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label htmlFor="qrSize" className="form-label">
                  QR Code Size
                </label>
                <select
                  id="qrSize"
                  value={qrSize}
                  onChange={(e) => setQrSize(e.target.value)}
                  className="form-input"
                >
                  <option value="small">Small (128x128)</option>
                  <option value="medium">Medium (192x192)</option>
                  <option value="large">Large (256x256)</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeInfo"
                  checked={includeInfo}
                  onChange={(e) => setIncludeInfo(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="includeInfo" className="text-sm text-gray-700 dark:text-gray-300">
                  Include equipment info below QR code
                </label>
              </div>
            </div>
          </div>

          {/* QR Code Tips */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Code Tips
              </h3>
            </div>
            <div className="card-body space-y-3">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-info-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Print Quality
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Use high contrast printing for better scanning
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-info-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Placement
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Place QR codes in easily accessible locations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-info-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Protection
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Consider laminating QR codes for durability
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </div>
            <div className="card-body space-y-3">
              <button
                onClick={() => navigate(`/equipment/${id}`)}
                className="btn-outline w-full"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Equipment
              </button>
              <button
                onClick={() => navigate(`/equipment/${id}/edit`)}
                className="btn-outline w-full"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                Edit Equipment
              </button>
              <button
                onClick={() => navigate('/qr-scanner')}
                className="btn-primary w-full"
              >
                <QrCodeIcon className="w-4 h-4 mr-2" />
                Scan QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentQRCode;

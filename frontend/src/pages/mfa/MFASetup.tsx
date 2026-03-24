import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  QrCode,
  Key,
  CheckCircle,
  Copy,
  Download,
  ChevronRight,
  ChevronLeft,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MFAForm } from '@/components/forms/MFAForm';
import { ROUTES } from '@/utils/constants';
import { validationManager } from '@/utils/validation';
import { apiClient, API_ENDPOINTS } from '@/api/client';
import { API_BASE_URL } from '@/utils/constants';
import type { ApiError, MFASetupResponse, MFAVerifySetupResponse } from '@/api/types';
import { AutoSEO } from '@/components/seo/SEO';

type SetupStep = 'qr' | 'verify' | 'complete';

export const MFASetup = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<SetupStep>('qr');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Initialize MFA setup on mount
  useEffect(() => {
    const initializeSetup = async () => {
      setIsLoadingSetup(true);
      try {
        const response = await apiClient.post<MFASetupResponse>(API_ENDPOINTS.MFA.SETUP);
        
        setSecret(response.secret);
        
        // Construct QR code URL using API_ENDPOINTS helper for consistency
        // The QR endpoint returns a PNG image, so we need the full URL
        const baseURL = API_BASE_URL.includes('/api/v1') 
          ? API_BASE_URL.replace('/api/v1', '')
          : API_BASE_URL.replace('/api', '') || 'http://localhost:5000';
        // Use API_ENDPOINTS helper instead of backend-provided URL for reliability
        const qrEndpoint = API_ENDPOINTS.MFA.QR(response.secret, response.userEmail);
        const qrUrl = `${baseURL}${qrEndpoint}`;
        setQrCodeUrl(qrUrl);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message || 'Failed to initialize MFA setup', {
          icon: <XCircle className="h-5 w-5" />,
        });
        navigate(ROUTES.PROFILE);
      } finally {
        setIsLoadingSetup(false);
      }
    };

    initializeSetup();
  }, [navigate]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret key copied to clipboard!', {
      icon: <CheckCircle className="h-5 w-5" />,
    });
  };

  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded!', {
      icon: <CheckCircle className="h-5 w-5" />,
    });
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard!', {
      icon: <CheckCircle className="h-5 w-5" />,
    });
  };

  const handleVerifyCode = async (code: string) => {
    setIsLoading(true);

    // Validate TOTP code
    const validation = validationManager.validateTOTP(code);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid code', {
        icon: <XCircle className="h-5 w-5" />,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post<MFAVerifySetupResponse>(
        API_ENDPOINTS.MFA.VERIFY_SETUP,
        { token: code }
      );

      // Parse backup codes from response (format: "1. CODE1\n2. CODE2\n...")
      const codes = response.backupCodes
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          // Remove numbering if present (e.g., "1. CODE" -> "CODE")
          const match = line.match(/^\d+\.\s*(.+)$/);
          return match ? match[1] : line;
        })
        .filter((code) => code.length > 0);

      setBackupCodes(codes);
      setCurrentStep('complete');
      toast.success('MFA setup completed successfully!', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to verify MFA setup', {
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    navigate(ROUTES.PROFILE);
  };

  return (
    <>
      <AutoSEO />
      <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary-600" />
                Set Up Two-Factor Authentication
              </h1>
              <p className="mt-2 text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === 'qr'
                        ? 'bg-primary-600 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {currentStep === 'qr' ? '1' : <CheckCircle className="h-5 w-5" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Scan QR Code</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentStep !== 'qr' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ width: currentStep !== 'qr' ? '100%' : '0%' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === 'verify'
                        ? 'bg-primary-600 text-white'
                        : currentStep === 'complete'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep === 'complete' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      '2'
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Verify</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ width: currentStep === 'complete' ? '100%' : '0%' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === 'complete'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep === 'complete' ? <CheckCircle className="h-5 w-5" /> : '3'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Complete</span>
                </div>
              </div>
            </div>

            {/* Step 1: QR Code */}
            {currentStep === 'qr' && (
              <Card variant="elevated" padding="lg">
                {isLoadingSetup ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <p className="mt-4 text-sm text-gray-600">Loading MFA setup...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Scan QR Code
                      </h2>
                      <p className="text-sm text-gray-600">
                        Use your authenticator app to scan this QR code
                      </p>
                    </div>

                    {qrCodeUrl && (
                      <div className="flex justify-center">
                        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                          <img
                            src={qrCodeUrl}
                            alt="QR Code for MFA setup"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    )}

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4 flex items-center justify-center gap-2">
                      <QrCode className="h-4 w-4" />
                      Scan with Google Authenticator, Authy, or similar app
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowManualEntry(!showManualEntry)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          Can't scan? Enter code manually
                        </span>
                      </div>
                      {showManualEntry ? (
                        <ChevronRight className="h-5 w-5 text-gray-500 rotate-90" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    {showManualEntry && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secret Key
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={secret}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              icon={<Copy className="h-4 w-4" />}
                              onClick={handleCopySecret}
                            >
                              Copy
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Enter this code manually in your authenticator app
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      icon={<ChevronRight className="h-5 w-5" />}
                      iconPosition="right"
                      onClick={() => setCurrentStep('verify')}
                    >
                      Continue
                    </Button>
                  </div>
                  </div>
                )}
              </Card>
            )}

            {/* Step 2: Verification */}
            {currentStep === 'verify' && (
              <Card variant="elevated" padding="lg">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Verify Setup
                    </h2>
                    <p className="text-sm text-gray-600">
                      Enter the 6-digit code from your authenticator app to complete setup
                    </p>
                  </div>

                  <MFAForm
                    onSubmit={handleVerifyCode}
                    isLoading={isLoading}
                    showBackupCodeOption={false}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      icon={<ChevronLeft className="h-5 w-5" />}
                      onClick={() => setCurrentStep('qr')}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Complete */}
            {currentStep === 'complete' && (
              <Card variant="elevated" padding="lg">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Setup Complete!
                    </h2>
                    <p className="text-sm text-gray-600">
                      Two-factor authentication is now enabled for your account
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Key className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                          Save Your Backup Codes
                        </h3>
                        <p className="text-sm text-yellow-800 mb-3">
                          These codes can be used to access your account if you lose your
                          authenticator device. Store them in a safe place.
                        </p>
                        <div className="bg-white rounded-lg p-4 border border-yellow-200 mb-3">
                          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                            {backupCodes.map((code, index) => (
                              <div key={index} className="text-gray-700">
                                {code}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<Copy className="h-4 w-4" />}
                            onClick={handleCopyBackupCodes}
                          >
                            Copy Codes
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<Download className="h-4 w-4" />}
                            onClick={handleDownloadBackupCodes}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      icon={<CheckCircle className="h-5 w-5" />}
                      onClick={handleComplete}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </Card>
            )}
      </div>
    </>
  );
};


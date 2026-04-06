// components/checkout/PrescriptionUploader.tsx
import React from 'react';
import { Prescription } from '../../lib/prescriptionService';
import { toast } from 'react-hot-toast';

interface PrescriptionUploaderProps {
  userPrescriptions: Prescription[];
  selectedPrescriptions: number[];
  onPrescriptionSelect: (prescriptionId: number) => void;
  onPrescriptionUpload: (file: File) => Promise<Prescription>;
  loading: boolean;
}

const PrescriptionUploader: React.FC<PrescriptionUploaderProps> = ({
  userPrescriptions,
  selectedPrescriptions,
  onPrescriptionSelect,
  onPrescriptionUpload,
  loading
}) => {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or PDF file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const newPrescription = await onPrescriptionUpload(file);
      // Auto-select the newly uploaded prescription
      onPrescriptionSelect(newPrescription.id);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border-2 border-amber-300 bg-amber-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-800 flex items-center">
          <span className="text-xl mr-2">📋</span>
          Prescription Required
        </h3>
        <div className="flex items-center gap-2">
          {selectedPrescriptions.length > 0 && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              {selectedPrescriptions.length} selected
            </span>
          )}
          <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full">
            Required
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-amber-700 mb-3">
          <strong>Important:</strong> The following products in your cart require a valid prescription:
        </p>
        
        {/* Upload Section */}
        <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            disabled={uploading}
          />
          
          <div className="text-amber-600 mb-3">
            <span className="text-4xl">📤</span>
          </div>
          
          <h4 className="font-semibold text-amber-800 mb-2">
            Upload New Prescription
          </h4>
          
          <p className="text-amber-600 text-sm mb-4">
            Upload a clear image or PDF of your prescription
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </button>
          
          <p className="text-xs text-amber-500 mt-2">
            Supports: JPG, PNG, PDF (Max 5MB)
          </p>
        </div>

        {/* Existing Prescriptions */}
        {userPrescriptions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
              <span className="text-lg mr-2">📁</span>
              Your Existing Prescriptions
            </h4>
            
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {userPrescriptions.map(prescription => (
                <label
                  key={prescription.id}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPrescriptions.includes(prescription.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPrescriptions.includes(prescription.id)}
                    onChange={() => onPrescriptionSelect(prescription.id)}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-amber-300 rounded"
                  />
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {prescription.fileName}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        prescription.isValidated 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prescription.isValidated ? 'Validated' : 'Pending'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mt-1">
                      Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}
                    </p>
                    
                    {prescription.notes && (
                      <p className="text-xs text-slate-500 mt-1">
                        {prescription.notes}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* No Prescriptions State */}
        {userPrescriptions.length === 0 && (
          <div className="text-center py-4">
            <p className="text-amber-600">
              No prescriptions found. Please upload your prescription above.
            </p>
          </div>
        )}
      </div>

      {/* Validation Status */}
      {selectedPrescriptions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-500 text-lg mr-2">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-800">Prescription Status</p>
              <p className="text-sm text-blue-700">
                {selectedPrescriptions.length} prescription(s) selected. 
                Your order will be processed after prescription validation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionUploader;
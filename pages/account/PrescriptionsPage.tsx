import React, { useState, useRef, useEffect } from 'react';
import Button from '../../components/shared/Button';
import { toast } from 'react-hot-toast';
import { ICONS } from '../../constants';
import { prescriptionService, Prescription, PrescriptionStats } from '../../lib/prescriptionService';

const PrescriptionsPage: React.FC = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [uploading, setUploading] = useState<boolean>(false);
    const [stats, setStats] = useState<PrescriptionStats>({
        total: 0,
        validated: 0,
        pending: 0,
        rejected: 0,
        recentUploads: 0
    });
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPrescriptionsData = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await prescriptionService.getPrescriptions();
            setPrescriptions(response.prescriptions);
            
            // Also load stats
            const statsData = await prescriptionService.getUserPrescriptionStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error loading prescriptions:', error);
            setError('Failed to load prescriptions');
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrescriptionsData();
    }, []);

    const handleFileUpload = async (file: File): Promise<void> => {
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            toast.error('Please upload an image or PDF file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const result = await prescriptionService.uploadPrescription(file);
            const newPrescription = result.prescription;
            setPrescriptions(prev => [newPrescription, ...prev]);
            
            // Update stats by reloading them
            const statsData = await prescriptionService.getUserPrescriptionStats();
            setStats(statsData);
            
            toast.success(result.message || `Prescription "${file.name}" uploaded successfully`);
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            console.error('Error uploading prescription:', error);
            const errorMessage = error?.message || 'Failed to upload prescription';
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files.length > 0) {
            handleFileUpload(event.target.files[0]);
        }
    };

    const handleDelete = async (id: number, fileName: string): Promise<void> => {
        if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
            return;
        }

        try {
            await prescriptionService.deletePrescription(id);
            setPrescriptions(prev => prev.filter(p => p.id !== id));
            
            // Update stats by reloading them
            const statsData = await prescriptionService.getUserPrescriptionStats();
            setStats(statsData);
            
            toast.success("Prescription deleted successfully");
        } catch (error: any) {
            console.error('Error deleting prescription:', error);
            const errorMessage = error?.message || 'Failed to delete prescription';
            toast.error(errorMessage);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string | Date): string => {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (prescription: Prescription): JSX.Element => {
        if (prescription.isValidated) {
            return (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ✅ Validated
                </span>
            );
        } else if (prescription.validatedAt && !prescription.isValidated) {
            return (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    ❌ Rejected
                </span>
            );
        } else {
            return (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                    ⏳ Pending Review
                </span>
            );
        }
    };

    const refreshPrescriptions = (): void => {
        loadPrescriptionsData();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">My Prescriptions</h1>
                    <p className="text-slate-600 mt-2">Manage and upload your medical prescriptions</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={refreshPrescriptions}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload Prescription'}
                    </Button>
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                    />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-600">Total</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
                    <div className="text-sm text-slate-600">Validated</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    <div className="text-sm text-slate-600">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    <div className="text-sm text-slate-600">Rejected</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.recentUploads}</div>
                    <div className="text-sm text-slate-600">Recent (30d)</div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Prescriptions List */}
            {prescriptions.length === 0 ? (
                <div className="text-center border-2 border-dashed rounded-xl p-12 bg-slate-50">
                    <div className="text-slate-400 mb-4 mx-auto w-16 h-16 flex items-center justify-center">
                        {React.cloneElement(ICONS.upload, { className: "w-12 h-12" })}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No prescriptions yet</h3>
                    <p className="text-slate-500 mb-4">Upload your first prescription to get started</p>
                    <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload Your First Prescription'}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((prescription: Prescription) => (
                        <div key={prescription.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                            <span className="text-xl">
                                                {prescription.fileName.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-slate-900 text-lg">{prescription.fileName}</h3>
                                                {getStatusBadge(prescription)}
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {formatFileSize(prescription.fileSize)} • Uploaded {formatDate(prescription.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {prescription.notes && (
                                        <div className="bg-slate-50 p-3 rounded-lg mt-3">
                                            <p className="text-sm text-slate-700">
                                                <strong>Note:</strong> {prescription.notes}
                                            </p>
                                        </div>
                                    )}

                                    {prescription.orderIds && prescription.orderIds.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-slate-500">
                                                Used in {prescription.orderIds.length} order(s)
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-coral hover:bg-red-50 hover:text-red-700" 
                                        onClick={() => handleDelete(prescription.id, prescription.fileName)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                            
                            {prescription.validatedAt && (
                                <div className="text-xs text-slate-500 border-t border-slate-200 pt-3 mt-3">
                                    {prescription.isValidated ? 'Validated' : 'Rejected'} on {formatDate(prescription.validatedAt)}
                                    {prescription.validatedByUser && ` by ${prescription.validatedByUser.firstName} ${prescription.validatedByUser.lastName}`}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Guidelines */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Prescription Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload clear images or PDF files of your prescription</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Supported formats: JPG, PNG, PDF, WebP</li>
                    <li>• Prescriptions are reviewed by our pharmacy team within 24 hours</li>
                    <li>• You'll receive notifications when your prescription is validated or rejected</li>
                </ul>
            </div>
        </div>
    );
};

export default PrescriptionsPage;
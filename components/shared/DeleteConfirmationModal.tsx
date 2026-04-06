// src/components/shared/DeleteConfirmationModal.tsx
import React from 'react';
import Button from './Button';

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-600">{message}</p>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
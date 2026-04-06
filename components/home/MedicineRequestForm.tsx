import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../shared/Button';
import { medicationRequestService } from '../../lib/medicationRequestService';

interface MedicineRequestFormData {
  name: string;
  email: string;
  phone: string;
  medicineName: string;
  message: string;
}

const MedicineRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<MedicineRequestFormData>({
    name: '',
    email: '',
    phone: '',
    medicineName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await medicationRequestService.createMedicationRequest(formData);
      
      if (response.success) {
        toast.success('Your medication request has been submitted successfully! We will contact you shortly.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          medicineName: '',
          message: ''
        });
      } else {
        const errorMessage = response.message || 'Failed to submit request. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error submitting medication request:', error);
      const errorMessage = error.message || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-soft-lg">
      <h3 className="text-2xl font-poppins font-bold text-slate-900 mb-4 text-center">
        Medication Request Form
      </h3>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone No"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart"
        />
        <input
          type="text"
          name="medicineName"
          placeholder="Name Your Medicine"
          value={formData.medicineName}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart"
        />
        <textarea
          name="message"
          placeholder="Additional Message (Optional)"
          rows={2}
          value={formData.message}
          onChange={handleInputChange}
          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart"
        />
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Send Request'}
        </Button>
      </form>
    </div>
  );
};

export default MedicineRequestForm;
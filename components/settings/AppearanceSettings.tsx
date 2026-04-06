import React from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';

const AppearanceSettings: React.FC = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Appearance settings saved successfully!');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4 border-b pb-2">Appearance</h2>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold">Colors</h3>
                        <div className="flex items-center space-x-4">
                            <label className="w-32 text-sm font-medium text-slate-700">Primary Start</label>
                            <input type="color" defaultValue="#2bb6a6" className="w-12 h-10 p-1 bg-white border border-slate-300 rounded-lg" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="w-32 text-sm font-medium text-slate-700">Primary End</label>
                            <input type="color" defaultValue="#2f80ed" className="w-12 h-10 p-1 bg-white border border-slate-300 rounded-lg" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="w-32 text-sm font-medium text-slate-700">Accent</label>
                            <input type="color" defaultValue="#FF7A7A" className="w-12 h-10 p-1 bg-white border border-slate-300 rounded-lg" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold">Branding</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
                            <input type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Favicon</label>
                            <input type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"/>
                        </div>
                    </div>
                </div>
                <div className="border-t pt-6 space-y-4">
                    <h3 className="text-md font-semibold">Typography & Style</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Font Scheme</label>
                        <select className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm">
                            <option>Inter / Merriweather</option>
                            <option>Poppins / Lora</option>
                            <option>Roboto / Playfair Display</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">UI Roundness</label>
                        <div className="flex space-x-4">
                            <label><input type="radio" name="roundness" defaultChecked/> Sharp</label>
                            <label><input type="radio" name="roundness"/> Rounded</label>
                            <label><input type="radio" name="roundness"/> Full</label>
                        </div>
                    </div>
                </div>
                <div className="text-right pt-4 border-t">
                    <Button type="submit">Save Appearance</Button>
                </div>
            </form>
        </div>
    );
};

export default AppearanceSettings;
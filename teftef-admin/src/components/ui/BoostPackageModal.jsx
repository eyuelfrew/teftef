import React, { useState, useEffect } from 'react';
import { X, Loader2, Zap, Clock, DollarSign } from 'lucide-react';
import { cn } from '../../utils/cn';

const BoostPackageModal = ({ isOpen, onClose, onSave, pkg }) => {
    const [formData, setFormData] = useState({
        name: '',
        durationDays: 1,
        price: 0,
        isEnabled: true,
    });
    const [loading, setLoading] = useState(false);

    const durationOptions = [
        { label: '1 Minute (Test)', value: 1 / 1440 },
        { label: '5 Minutes (Test)', value: 5 / 1440 },
        { label: '10 Minutes (Test)', value: 10 / 1440 },
        { label: '1 Day', value: 1 },
        { label: '7 Days', value: 7 },
        { label: '14 Days', value: 14 },
        { label: '1 Month', value: 30 },
        { label: '2 Months', value: 60 },
        { label: '6 Months', value: 180 },
    ];

    useEffect(() => {
        if (pkg) {
            setFormData({
                name: pkg.name,
                durationDays: pkg.durationDays || (pkg.durationHours / 24) || 1,
                price: pkg.price,
                isEnabled: pkg.isEnabled,
            });
        } else {
            setFormData({
                name: '',
                durationDays: 1,
                price: 0,
                isEnabled: true,
            });
        }
    }, [pkg, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' || name === 'durationDays' ? parseFloat(value) : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save boost package", error);
            alert("Failed to save boost package. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                <div
                    className="bg-white w-full max-w-lg rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden pointer-events-auto"
                >
                    <div className="px-8 py-6 border-b border-neutral-50 flex items-center justify-between bg-white/50 backdrop-blur-xl">
                        <div>
                            <h2 className="text-xl font-bold text-[#0a0a0a]">
                                {pkg ? 'Edit Boost Package' : 'New Boost Package'}
                            </h2>
                            <p className="text-sm text-neutral-400 mt-1">Configure visibility boost options</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-[#0a0a0a] transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#0a0a0a] mb-2 uppercase tracking-tight">Package Name</label>
                            <div className="relative group">
                                <Zap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5 pl-10"
                                    placeholder="e.g. 7 Days Premium Boost"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2 uppercase tracking-tight">Duration</label>
                                <div className="relative group">
                                    <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors z-10" />
                                    <select
                                        name="durationDays"
                                        value={formData.durationDays}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5 pl-10 appearance-none shadow-sm shadow-black/5"
                                        required
                                    >
                                        {durationOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2 uppercase tracking-tight">Price (ETB)</label>
                                <div className="relative group">
                                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5 pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isEnabled"
                                    checked={formData.isEnabled}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a0a0a]"></div>
                                <span className="ms-3 text-sm font-medium text-neutral-700">Package Enabled</span>
                            </label>
                            <p className="text-[10px] text-neutral-400 ml-auto italic">Inactive packages won't be visible to users.</p>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-neutral-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-neutral-500 font-medium hover:bg-neutral-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-black/5 disabled:opacity-50 flex items-center gap-2 text-sm"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {loading ? 'Saving...' : (pkg ? 'Update Package' : 'Create Package')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default BoostPackageModal;

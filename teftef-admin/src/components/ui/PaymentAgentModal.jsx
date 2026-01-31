import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Landmark, CreditCard, Power } from 'lucide-react';
import { cn } from '../../utils/cn';

const PaymentAgentModal = ({ isOpen, onClose, onSave, agent }) => {
    const [formData, setFormData] = useState({
        name: '',
        bankName: '',
        accountNumber: '',
        isEnabled: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (agent) {
            setFormData({
                name: agent.name,
                bankName: agent.bankName,
                accountNumber: agent.accountNumber,
                isEnabled: agent.isEnabled,
            });
        } else {
            setFormData({
                name: '',
                bankName: '',
                accountNumber: '',
                isEnabled: true,
            });
        }
    }, [agent, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save payment agent", error);
            alert("Failed to save payment agent. Please try again.");
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
                                {agent ? 'Edit Payment Agent' : 'New Payment Agent'}
                            </h2>
                            <p className="text-sm text-neutral-400 mt-1">Configure bank accounts for boost payments</p>
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
                            <label className="block text-sm font-semibold text-[#0a0a0a] mb-2 uppercase tracking-tight">Agent Name</label>
                            <div className="relative group">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5 pl-10"
                                    placeholder="e.g. Finance Agent 1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2 uppercase tracking-tight">Bank Name</label>
                                <div className="relative group">
                                    <Landmark size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5 pl-10"
                                        placeholder="e.g. CBE"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2 uppercase tracking-tight">Account Number</label>
                                <div className="relative group">
                                    <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5 pl-10"
                                        placeholder="1000..."
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
                                <span className="ms-3 text-sm font-medium text-neutral-700">Agent Active</span>
                            </label>
                            <p className="text-[10px] text-neutral-400 ml-auto italic">Inactive agents won't be shown to users.</p>
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
                                {loading ? 'Saving...' : (agent ? 'Update Agent' : 'Create Agent')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default PaymentAgentModal;

import React, { useState, useEffect } from 'react';
import { X, Shield, Mail, Lock, User, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminModal = ({ isOpen, onClose, onSave, admin = null }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        is_super_admin: false,
        status: 'active'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (admin) {
            setFormData({
                first_name: admin.first_name || '',
                last_name: admin.last_name || '',
                email: admin.email || '',
                password: '', // Don't show password on edit
                is_super_admin: admin.is_super_admin || false,
                status: admin.status || 'active'
            });
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                is_super_admin: false,
                status: 'active'
            });
        }
    }, [admin, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save admin. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <div
                    onClick={onClose}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                />

                <div
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                        <h2 className="text-xl font-bold text-[#0a0a0a]">
                            {admin ? 'Edit Administrator' : 'Create New Administrator'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-[#0a0a0a] transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="John"
                                    className="block w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    placeholder="Doe"
                                    className="block w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-neutral-700 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@example.com"
                                className="block w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                            />
                        </div>

                        {!admin && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="block w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-4 py-2">
                            <label className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 cursor-pointer hover:bg-neutral-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_super_admin}
                                    onChange={(e) => setFormData({ ...formData, is_super_admin: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-[#0a0a0a] focus:ring-[#0a0a0a]"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-[#0a0a0a]">Super Admin Privileges</p>
                                    <p className="text-xs text-neutral-500">Can manage other administrators.</p>
                                </div>
                            </label>

                            {admin && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-neutral-700 ml-1">Account Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="block w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                                    >
                                        <option value="active">Active</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-500 hover:bg-neutral-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0a0a0a] hover:bg-neutral-800 transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Administrator'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminModal;

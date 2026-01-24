import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Link as LinkIcon, AlertCircle, Building2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const SponsorshipModal = ({ isOpen, onClose, onSave, sponsorship }) => {
    const [formData, setFormData] = useState({
        company_name: '',
        title: '',
        external_link: '',
        priority: 0,
        is_active: true,
        image: null,
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sponsorship) {
            setFormData({
                company_name: sponsorship.company_name,
                title: sponsorship.title,
                external_link: sponsorship.external_link,
                priority: sponsorship.priority,
                is_active: sponsorship.is_active,
                image: null,
            });
            setPreviewUrl(sponsorship.image_url ? `http://localhost:5000${sponsorship.image_url}` : '');
        } else {
            setFormData({
                company_name: '',
                title: '',
                external_link: '',
                priority: 0,
                is_active: true,
                image: null,
            });
            setPreviewUrl('');
        }
    }, [sponsorship, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('company_name', formData.company_name);
        data.append('title', formData.title);
        data.append('external_link', formData.external_link);
        data.append('priority', formData.priority);
        data.append('is_active', formData.is_active);

        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await onSave(data);
            onClose();
        } catch (error) {
            console.error("Failed to save sponsorship", error);
            alert("Failed to save sponsorship. Please try again.");
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
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden pointer-events-auto"
                >
                    <div className="px-8 py-6 border-b border-neutral-50 flex items-center justify-between bg-white/50 backdrop-blur-xl">
                        <div>
                            <h2 className="text-xl font-bold text-[#0a0a0a]">
                                {sponsorship ? 'Edit Partner' : 'New Partner'}
                            </h2>
                            <p className="text-sm text-neutral-400 mt-1">Manage external sponsorship details</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-[#0a0a0a] transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Promotional Banner</label>
                                <div className="flex gap-6">
                                    <div className="relative group w-48 h-28 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-[#0a0a0a] transition-all flex flex-col items-center justify-center cursor-pointer bg-neutral-50 hover:bg-neutral-100 overflow-hidden">
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-neutral-400 mb-2 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs text-neutral-400 font-medium">Upload Banner</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-1 text-sm text-neutral-500">
                                        <div className="flex items-start gap-2 mb-2">
                                            <AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                            <p>This banner will be displayed to users. Ensure high quality.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Company Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleChange}
                                            className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5 pl-10"
                                            placeholder="e.g. Ride Corp"
                                            required
                                        />
                                        <Building2 className="absolute left-3 top-2.5 text-neutral-400 w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Promo Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                        placeholder="e.g. 50% Off First Trip"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Action Link */}
                            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <label className="block text-sm font-bold text-[#0a0a0a] mb-2 flex items-center gap-2">
                                    <LinkIcon size={16} />
                                    Destination URL
                                </label>
                                <input
                                    type="url"
                                    name="external_link"
                                    value={formData.external_link}
                                    onChange={handleChange}
                                    placeholder="https://partner-website.com/promo"
                                    required
                                    className="w-full rounded-xl bg-white border-neutral-200 focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                />
                                <p className="text-xs text-neutral-400 mt-2">Users will be redirected here when tapping the banner.</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Priority</label>
                                    <input
                                        type="number"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a0a0a]"></div>
                                        <span className="ms-3 text-sm font-medium text-neutral-700">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-neutral-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-neutral-500 font-medium hover:bg-neutral-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-black/5 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {loading ? 'Saving...' : 'Save Partner'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SponsorshipModal;

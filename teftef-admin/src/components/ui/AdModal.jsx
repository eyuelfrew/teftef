import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Link as LinkIcon, ShoppingBag, Layers, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { cn } from '../../utils/cn';

const AdModal = ({ isOpen, onClose, onSave, ad }) => {
    const [formData, setFormData] = useState({
        title: '',
        ad_type: 'home_banner', // Default
        target_type: 'product', // Default
        target_id: '',
        external_link: '',
        priority: 0,
        is_active: true,
        image: null,
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingTargets, setFetchingTargets] = useState(false);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (ad) {
            setFormData({
                title: ad.title,
                ad_type: ad.ad_type,
                target_type: ad.target_type,
                target_id: ad.target_id || '',
                external_link: ad.external_link || '',
                priority: ad.priority,
                is_active: ad.is_active,
                image: null,
            });
            setPreviewUrl(ad.image_url ? `http://localhost:5000${ad.image_url}` : '');
        } else {
            // Reset for create
            setFormData({
                title: '',
                ad_type: 'home_banner',
                target_type: 'category',
                target_id: '',
                external_link: '',
                priority: 0,
                is_active: true,
                image: null,
            });
            setPreviewUrl('');
        }
    }, [ad, isOpen]);

    // Fetch targets when target_type changes
    useEffect(() => {
        const fetchTargets = async () => {
            setFetchingTargets(true);
            try {
                if (formData.target_type === 'category' && categories.length === 0) {
                    const res = await api.get('/categories');
                    setCategories(res.data.data.categories);
                } else if (formData.target_type === 'product' && products.length === 0) {
                    const res = await api.get('/products');
                    setProducts(res.data.data.products);
                }
            } catch (err) {
                console.error("Failed to fetch targets", err);
            } finally {
                setFetchingTargets(false);
            }
        };

        if (isOpen) {
            fetchTargets();
        }
    }, [formData.target_type, isOpen]);

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
        data.append('title', formData.title);
        data.append('ad_type', formData.ad_type);
        data.append('target_type', formData.target_type);
        data.append('priority', formData.priority);
        data.append('is_active', formData.is_active);

        if (formData.target_type === 'category' || formData.target_type === 'product') {
            data.append('target_id', formData.target_id);
            data.append('external_link', ''); // Clear external link
        } else {
            data.append('external_link', formData.external_link);
            data.append('target_id', ''); // Clear target id
        }

        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await onSave(data);
            onClose();
        } catch (error) {
            console.error("Failed to save ad", error);
            alert("Failed to save advertisement. Please try again.");
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
                                {ad ? 'Edit Advertisement' : 'New Advertisement'}
                            </h2>
                            <p className="text-sm text-neutral-400 mt-1">Configure your ad campaign details</p>
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
                                <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Ad Image</label>
                                <div className="flex gap-6">
                                    <div className="relative group w-48 h-32 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-[#0a0a0a] transition-all flex flex-col items-center justify-center cursor-pointer bg-neutral-50 hover:bg-neutral-100 overflow-hidden">
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
                                                <span className="text-xs text-neutral-400 font-medium">Click to upload</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-1 text-sm text-neutral-500">
                                        <div className="flex items-start gap-2 mb-2">
                                            <AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                            <p>Supported formats: JPG, PNG, WEBP, AVIF. Max size: 5MB.</p>
                                        </div>
                                        <p>Make sure the aspect ratio matches the Ad Type selected below.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Title (Internal)</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                        placeholder="e.g. Summer Sale Banner"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Ad Type</label>
                                    <select
                                        name="ad_type"
                                        value={formData.ad_type}
                                        onChange={handleChange}
                                        className="w-full rounded-xl bg-neutral-50 border-transparent focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                    >
                                        <option value="home_banner">Home Banner</option>
                                        <option value="category_banner">Category Banner</option>
                                        <option value="mini_popup">Mini Popup</option>
                                        <option value="interstitial_popup">Interstitial Popup (Full Screen)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Smart Target Logic */}
                            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <label className="block text-sm font-bold text-[#0a0a0a] mb-4 flex items-center gap-2">
                                    <LinkIcon size={16} />
                                    Tap Action (Target)
                                </label>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">Target Type</label>
                                        <select
                                            name="target_type"
                                            value={formData.target_type}
                                            onChange={handleChange}
                                            className="w-full rounded-xl bg-white border-neutral-200 focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                        >
                                            <option value="category">Navigate to Category</option>
                                            <option value="product">Navigate to Product</option>
                                            <option value="external_url">Open External URL</option>
                                        </select>
                                    </div>

                                    {/* Dynamic Field */}
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                        {formData.target_type === 'category' && (
                                            <div>
                                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block flex items-center justify-between">
                                                    Select Category
                                                    {fetchingTargets && <Loader2 size={10} className="animate-spin" />}
                                                </label>
                                                <select
                                                    name="target_id"
                                                    value={formData.target_id}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-xl bg-white border-neutral-200 focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                                >
                                                    <option value="">-- Choose Category --</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {formData.target_type === 'product' && (
                                            <div>
                                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block flex items-center justify-between">
                                                    Select Product
                                                    {fetchingTargets && <Loader2 size={10} className="animate-spin" />}
                                                </label>
                                                <select
                                                    name="target_id"
                                                    value={formData.target_id}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full rounded-xl bg-white border-neutral-200 focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                                >
                                                    <option value="">-- Choose Product --</option>
                                                    {products.map(prod => (
                                                        <option key={prod.id} value={prod.id}>{prod.name} (${prod.price})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {formData.target_type === 'external_url' && (
                                            <div>
                                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 block">Website Link</label>
                                                <input
                                                    type="url"
                                                    name="external_link"
                                                    value={formData.external_link}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com"
                                                    required
                                                    className="w-full rounded-xl bg-white border-neutral-200 focus:border-[#0a0a0a] focus:ring-0 transition-all text-sm py-2.5"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-[#0a0a0a] mb-2">Priority (Sorting)</label>
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
                                        <span className="ms-3 text-sm font-medium text-neutral-700">Ad Active</span>
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
                                {loading ? 'Saving...' : 'Save Advertisement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdModal;

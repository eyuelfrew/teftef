import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Plus,
    Trash2,
    Edit2,
    ImageIcon,
    Link as LinkIcon,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle
} from 'lucide-react';
import AdModal from '../../components/ui/AdModal';
import { cn } from '../../utils/cn';

const AdManagement = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState(null);

    const fetchAds = async () => {
        try {
            const response = await api.get('/ads');
            setAds(response.data.data.ads);
        } catch (err) {
            console.error("Failed to fetch ads", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleSaveAd = async (formData) => {
        if (editingAd) {
            await api.patch(`/ads/${editingAd.id}`, formData);
        } else {
            await api.post('/ads', formData);
        }
        await fetchAds();
    };

    const handleDeleteAd = async (id) => {
        if (window.confirm('Are you sure you want to delete this advertisement?')) {
            try {
                await api.delete(`/ads/${id}`);
                await fetchAds();
            } catch (err) {
                alert('Failed to delete ad');
            }
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">Ad Campaigns</h1>
                    <p className="text-neutral-500 mt-1">Manage banners, popups, and promotional content.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAd(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-black/5 group"
                >
                    <Plus size={18} className="group-hover:scale-110 transition-transform" />
                    New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                    <div key={ad.id} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        {/* Image Preview */}
                        <div className="h-40 bg-neutral-100 relative overflow-hidden">
                            <img
                                src={`http://localhost:5000${ad.image_url}`}
                                alt={ad.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
                                    ad.is_active
                                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                        : "bg-neutral-900/10 text-neutral-600 border-neutral-900/10"
                                )}>
                                    {ad.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="absolute bottom-3 left-3">
                                <span className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10">
                                    {ad.ad_type.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="font-bold text-[#0a0a0a] truncate">{ad.title}</h3>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <LinkIcon size={14} />
                                    <span className="truncate">
                                        {ad.target_type === 'external_url' ? 'External Link' :
                                            ad.target_type === 'category' ? `Category ID: ${ad.target_id}` :
                                                `Product ID: ${ad.target_id}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 rounded text-neutral-500">
                                        Priority: {ad.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-neutral-50">
                                <button
                                    onClick={() => {
                                        setEditingAd(ad);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex-1 px-4 py-2 bg-neutral-50 text-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {ads.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4 text-neutral-300">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#0a0a0a]">No Campaigns Yet</h3>
                        <p className="text-neutral-500 mt-1 max-w-sm mx-auto">Create your first advertisement campaign to promote products or categories.</p>
                    </div>
                )}
            </div>

            <AdModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAd}
                ad={editingAd}
            />
        </div>
    );
};

export default AdManagement;

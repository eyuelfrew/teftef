import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Plus,
    Trash2,
    Edit2,
    ImageIcon,
    Link as LinkIcon,
    Loader2,
    Handshake,
    Building2,
    ExternalLink
} from 'lucide-react';
import SponsorshipModal from '../../components/ui/SponsorshipModal';
import { cn } from '../../utils/cn';

const SponsorshipManagement = () => {
    const [sponsorships, setSponsorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSponsorship, setEditingSponsorship] = useState(null);

    const fetchSponsorships = async () => {
        try {
            const response = await api.get('/sponsorships');
            setSponsorships(response.data.data.sponsorships);
        } catch (err) {
            console.error("Failed to fetch sponsorships", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsorships();
    }, []);

    const handleSaveSponsorship = async (formData) => {
        if (editingSponsorship) {
            await api.patch(`/sponsorships/${editingSponsorship.id}`, formData);
        } else {
            await api.post('/sponsorships', formData);
        }
        await fetchSponsorships();
    };

    const handleDeleteSponsorship = async (id) => {
        if (window.confirm('Are you sure you want to remove this partner?')) {
            try {
                await api.delete(`/sponsorships/${id}`);
                await fetchSponsorships();
            } catch (err) {
                alert('Failed to delete sponsorship');
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
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">Partner Sponsorships</h1>
                    <p className="text-neutral-500 mt-1">Manage external promotions and brand partnerships.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSponsorship(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-black/5 group"
                >
                    <Plus size={18} className="group-hover:scale-110 transition-transform" />
                    New Partner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsorships.map((sponsor) => (
                    <div key={sponsor.id} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
                        {/* Image Preview */}
                        <div className="h-40 bg-neutral-100 relative overflow-hidden">
                            <img
                                src={`http://localhost:5000${sponsor.image_url}`}
                                alt={sponsor.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
                                    sponsor.is_active
                                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                        : "bg-neutral-900/10 text-neutral-600 border-neutral-900/10"
                                )}>
                                    {sponsor.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <Building2 size={12} />
                                        {sponsor.company_name}
                                    </p>
                                    <h3 className="font-bold text-[#0a0a0a] text-lg leading-tight">{sponsor.title}</h3>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3 flex-1">
                                <div className="flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                                    <ExternalLink size={14} className="shrink-0" />
                                    <a href={sponsor.external_link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-blue-600">
                                        {sponsor.external_link}
                                    </a>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-neutral-50">
                                <button
                                    onClick={() => {
                                        setEditingSponsorship(sponsor);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex-1 px-4 py-2 bg-neutral-50 text-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteSponsorship(sponsor.id)}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {sponsorships.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4 text-neutral-300">
                            <Handshake size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#0a0a0a]">No Partners Yet</h3>
                        <p className="text-neutral-500 mt-1 max-w-sm mx-auto">Add external sponsorships to monetize your platform with third-party ads.</p>
                    </div>
                )}
            </div>

            <SponsorshipModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSponsorship}
                sponsorship={editingSponsorship}
            />
        </div>
    );
};

export default SponsorshipManagement;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Plus,
    Trash2,
    Edit2,
    Zap,
    Loader2,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import BoostPackageModal from '../../components/ui/BoostPackageModal';
import { cn } from '../../utils/cn';

const BoostPackageManagement = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);

    const fetchPackages = async () => {
        try {
            const response = await api.get('/admin/boost-packages');
            setPackages(response.data.data.packages);
        } catch (err) {
            console.error("Failed to fetch boost packages", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleSavePackage = async (formData) => {
        if (editingPkg) {
            await api.patch(`/admin/boost-packages/${editingPkg.id}`, formData);
        } else {
            await api.post('/admin/boost-packages', formData);
        }
        await fetchPackages();
    };

    const handleDeletePackage = async (id) => {
        if (window.confirm('Are you sure you want to delete this boost package?')) {
            try {
                await api.delete(`/admin/boost-packages/${id}`);
                await fetchPackages();
            } catch (err) {
                alert('Failed to delete package');
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
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">Boost Packages</h1>
                    <p className="text-neutral-500 mt-1">Configure visibility boost options for users.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPkg(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-black/5 group"
                >
                    <Plus size={18} className="group-hover:scale-110 transition-transform" />
                    New Package
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl bg-neutral-50 border border-neutral-100 group-hover:bg-[#0a0a0a] group-hover:text-white transition-colors duration-500",
                                    !pkg.isEnabled && "opacity-50"
                                )}>
                                    <Zap size={24} />
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                    pkg.isEnabled
                                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-700 border-red-500/20"
                                )}>
                                    {pkg.isEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">{pkg.name}</h3>

                            <div className="space-y-3 mt-6">
                                <div className="flex items-center gap-3 text-neutral-500">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Duration</p>
                                        <p className="text-sm font-semibold text-[#0a0a0a]">
                                            {pkg.durationDays >= 1
                                                ? `${pkg.durationDays} Day${pkg.durationDays > 1 ? 's' : ''}`
                                                : `${Math.round(pkg.durationDays * 1440)} Minutes`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-neutral-500">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center">
                                        <DollarSign size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Price</p>
                                        <p className="text-sm font-semibold text-[#0a0a0a]">{pkg.price} ETB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-neutral-50/50 border-t border-neutral-50 flex items-center gap-3 mt-auto">
                            <button
                                onClick={() => {
                                    setEditingPkg(pkg);
                                    setIsModalOpen(true);
                                }}
                                className="flex-1 px-4 py-2.5 bg-white text-neutral-600 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a] transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <Edit2 size={14} className="group-hover/btn:scale-110 transition-transform" /> Edit
                            </button>
                            <button
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="p-2.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {packages.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6 text-neutral-200">
                            <Zap size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0a0a0a]">No Boost Packages</h3>
                        <p className="text-neutral-500 mt-2 max-w-sm mx-auto">Create packages to allow users to boost their product visibility.</p>
                    </div>
                )}
            </div>

            <BoostPackageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePackage}
                pkg={editingPkg}
            />
        </div>
    );
};

export default BoostPackageManagement;

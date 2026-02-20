import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Zap,
    Loader2,
    Calendar,
    Package,
    User,
    Clock,
    Trash2,
    RefreshCcw,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';

const ActiveBoostManagement = () => {
    const [boosts, setBoosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [terminatingId, setTerminatingId] = useState(null);

    const fetchActiveBoosts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/active-boosts');

            if (response.data && response.data.data && Array.isArray(response.data.data.activeBoosts)) {
                setBoosts(response.data.data.activeBoosts);
            } else {
                console.warn("Unexpected API response structure", response.data);
                setBoosts([]);
            }
        } catch (err) {
            console.error("Failed to fetch active boosts", err);
            setBoosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveBoosts();
    }, []);

    const handleTerminate = async (id) => {
        if (!window.confirm("Are you sure you want to terminate this boost early? This will remove the product from the promoted section.")) return;

        setTerminatingId(id);
        try {
            await api.post(`/admin/active-boosts/${id}/terminate`);
            await fetchActiveBoosts();
        } catch (err) {
            alert("Failed to terminate boost: " + (err.response?.data?.message || err.message));
        } finally {
            setTerminatingId(null);
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
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">Active Boosts</h1>
                    <p className="text-neutral-500 mt-1">Currently promoted products on the platform.</p>
                </div>
                <button
                    onClick={fetchActiveBoosts}
                    className="p-2.5 bg-white border border-neutral-100 rounded-2xl text-neutral-500 hover:text-[#0a0a0a] shadow-sm transition-all"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a] p-8 rounded-[2rem] text-white shadow-2xl shadow-black/10 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                        <h3 className="text-neutral-400 font-medium">Live Promotions</h3>
                        <p className="text-5xl font-bold mt-2 tracking-tight">{boosts.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-50 bg-neutral-50/50">
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Product</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Owner</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Price</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Schedule (Start - End)</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {boosts.map((product) => (
                                <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                                                {product.images?.[0] ? (
                                                    <img src={`${import.meta.env.VITE_BACKEND}${product.images[0]}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={24} className="text-neutral-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#0a0a0a] line-clamp-1">{product.name}</p>
                                                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">ID: #{product.productId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
                                                <User size={14} className="text-neutral-400" />
                                            </div>
                                            <span className="text-sm font-medium text-neutral-600">{product.userFirstName} {product.userLastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-bold text-emerald-600">
                                            {product.price} ETB
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1 text-neutral-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-neutral-400" />
                                                <span className="text-xs font-semibold">
                                                    {new Date(product.startsAt).toLocaleDateString()} {new Date(product.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-60">
                                                <Clock size={12} className="text-neutral-400" />
                                                <span className="text-[11px] font-medium">
                                                    {new Date(product.expiresAt).toLocaleDateString()} {new Date(product.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {new Date(product.startsAt) > new Date() ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <Calendar size={12} />
                                                Scheduled
                                            </span>
                                        ) : product.isExpired ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <XCircle size={12} />
                                                Expired
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <Clock size={12} />
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleTerminate(product.productId)}
                                            disabled={terminatingId === product.productId}
                                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                            title="Terminate early"
                                        >
                                            {terminatingId === product.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {boosts.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6 text-neutral-200 border border-neutral-100">
                            <Zap size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0a0a0a]">No active boosts</h3>
                        <p className="text-neutral-500 mt-2 max-w-sm mx-auto">Currently there are no boosted products being promoted.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveBoostManagement;

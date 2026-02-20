import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

const BoostModerationModal = ({ isOpen, onClose, onApprove, request }) => {
    const [startTime, setStartTime] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Default to now, formatted for datetime-local input
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setStartTime(now.toISOString().slice(0, 16));
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onApprove(request.id, 'approved', startTime);
            onClose();
        } catch (error) {
            console.error("Failed to approve boost", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !request) return null;

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />
            <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden pointer-events-auto">
                    <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between">
                        <h2 className="font-bold text-[#0a0a0a]">Approve Boost</h2>
                        <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 trasition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <div className="w-12 h-12 rounded-xl bg-white border border-neutral-100 flex items-center justify-center overflow-hidden">
                                {request.product?.images?.[0] ? (
                                    <img src={`${import.meta.env.VITE_BACKEND}${request.product.images[0]}`} className="w-full h-full object-cover" />
                                ) : (
                                    <Clock className="text-neutral-300" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#0a0a0a] line-clamp-1">{request.product?.name}</p>
                                <p className="text-xs text-neutral-500 font-medium">
                                    {request.package?.name} ({request.package?.durationDays >= 1
                                        ? `${request.package.durationDays}d`
                                        : `${Math.round(request.package?.durationDays * 1440)}m`})
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Starting From</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full bg-neutral-50 border-transparent rounded-xl pl-11 pr-4 py-2.5 text-sm focus:bg-white focus:border-[#0a0a0a] focus:ring-0 transition-all"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-2 italic px-1">
                                You can schedule this for the future or start it immediately.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                Confirm Approval
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default BoostModerationModal;

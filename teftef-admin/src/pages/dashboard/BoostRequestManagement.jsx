import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Search,
    Loader2,
    Zap,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Package,
    Landmark,
    CreditCard
} from 'lucide-react';
import { cn } from '../../utils/cn';
import BoostModerationModal from '../../components/ui/BoostModerationModal';

const BoostRequestManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [processingId, setProcessingId] = useState(null);
    const [moderatingRequest, setModeratingRequest] = useState(null);
    const [view, setView] = useState('pending'); // 'pending' or 'history'

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/boost-packages/requests/all?history=${view === 'history'}`);
            setRequests(response.data.data.requests);
        } catch (err) {
            console.error("Failed to fetch boost requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [view]);

    const handleVerify = async (id, status, startTime = null, reason = '') => {
        setProcessingId(id);
        try {
            await api.post(`/admin/boost-packages/requests/${id}/verify`, {
                status,
                rejectionReason: reason,
                startTime
            });
            await fetchRequests();
            setModeratingRequest(null);
        } catch (err) {
            alert('Failed to process request: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (id) => {
        const reason = window.prompt('Enter rejection reason:', 'Payment verification failed');
        if (reason !== null) {
            handleVerify(id, 'rejected', reason);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">Boost Requests</h1>
                    <p className="text-neutral-500 mt-1">Verify and approve manual boost payments.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-neutral-100 p-1 rounded-2xl mr-4">
                        <button
                            onClick={() => setView('pending')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                view === 'pending' ? "bg-white text-[#0a0a0a] shadow-sm" : "text-neutral-500 hover:text-[#0a0a0a]"
                            )}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                view === 'history' ? "bg-white text-[#0a0a0a] shadow-sm" : "text-neutral-500 hover:text-[#0a0a0a]"
                            )}
                        >
                            Archive
                        </button>
                    </div>

                    <div className="relative group min-w-[300px]">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by ID, Email, Agent..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-neutral-100 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:ring-0 focus:border-[#0a0a0a] transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-50 bg-neutral-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Product / User</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment Destination</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Transaction ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Plan & Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Schedule</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                                {view === 'pending' && (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Verify</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Actions</th>
                                    </>
                                )}
                                {view === 'history' && (
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">Processed At</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                                                {req.product?.images?.[0] ? (
                                                    <img src={`${import.meta.env.VITE_BACKEND}${req.product.images[0]}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={20} className="text-neutral-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#0a0a0a] line-clamp-1">{req.product?.name || 'Deleted Product'}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <User size={12} className="text-neutral-400" />
                                                    <span className="text-[11px] text-neutral-500">{req.user?.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {req.agent ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-[#0a0a0a] flex items-center gap-1.5">
                                                    <Landmark size={14} className="text-neutral-400" /> {req.agent.name}
                                                </p>
                                                <p className="text-[11px] text-neutral-500 font-medium">
                                                    {req.agent.bankName} - {req.agent.accountNumber}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-[11px] text-neutral-400 font-medium italic">
                                                Legacy Request ({req.bankName || 'N/A'})
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <code className="px-2.5 py-1 bg-neutral-100 rounded-lg text-xs font-mono text-neutral-600">
                                            {req.transactionId}
                                        </code>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="text-sm font-bold text-[#0a0a0a]">{req.package?.name}</p>
                                            <p className="text-xs text-[#0a0a0a] font-medium mt-1">
                                                {req.package?.durationHours >= 24
                                                    ? `${Math.floor(req.package.durationHours / 24)}d`
                                                    : `${req.package?.durationHours}h`} • {req.package?.price} ETB
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {req.startTime ? (
                                            <div className="text-[11px] text-[#0a0a0a] font-medium">
                                                <p>{new Date(req.startTime).toLocaleDateString()} {new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-neutral-400 flex items-center gap-1 mt-0.5"><Clock size={10} /> {new Date(req.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-neutral-400 italic">Immediate</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            req.status === 'pending' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                            req.status === 'approved' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                            req.status === 'rejected' && "bg-red-500/10 text-red-600 border-red-500/20",
                                        )}>
                                            {req.status === 'pending' && <Clock size={12} />}
                                            {req.status === 'approved' && <CheckCircle2 size={12} />}
                                            {req.status === 'rejected' && <XCircle size={12} />}
                                            {req.status}
                                        </span>
                                    </td>
                                    {view === 'pending' && (
                                        <>
                                            <td className="px-6 py-5">
                                                <a
                                                    href={`https://apps.cbe.com.et:100/?id=${req.transactionId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-bold uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all group/link"
                                                >
                                                    CBE Port <ExternalLink size={12} />
                                                </a>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setModeratingRequest(req)}
                                                        disabled={processingId === req.id}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                                        title="Approve"
                                                    >
                                                        {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        disabled={processingId === req.id}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                    {view === 'history' && (
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-[11px] text-neutral-400 font-medium">
                                                {new Date(req.processedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRequests.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6 text-neutral-200">
                            <Zap size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0a0a0a]">No requests found</h3>
                        <p className="text-neutral-500 mt-2 max-w-sm mx-auto">Either there are no boost requests yet or your search criteria don't match any results.</p>
                    </div>
                )}
            </div>
            <BoostModerationModal
                isOpen={!!moderatingRequest}
                onClose={() => setModeratingRequest(null)}
                onApprove={handleVerify}
                request={moderatingRequest}
            />
        </div>
    );
};

export default BoostRequestManagement;

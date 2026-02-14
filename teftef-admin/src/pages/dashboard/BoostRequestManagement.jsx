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
    CreditCard,
    X,
    Info,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Tag
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
    const [detailUser, setDetailUser] = useState(null);
    const [detailProduct, setDetailProduct] = useState(null);
    const [detailPackage, setDetailPackage] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const handleViewUser = async (id, snapshot = null) => {
        if (snapshot) {
            setDetailUser({ ...snapshot, isSnapshot: true });
            return;
        }
        setDetailLoading(true);
        try {
            const response = await api.get(`/admin/boost-packages/users/${id}`);
            setDetailUser(response.data.data.user);
        } catch (err) {
            alert("Failed to fetch user details");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewProduct = async (id, snapshot = null) => {
        if (snapshot) {
            setDetailProduct({ ...snapshot, isSnapshot: true });
            return;
        }
        setDetailLoading(true);
        try {
            const response = await api.get(`/products/${id}`);
            setDetailProduct(response.data.data.product);
        } catch (err) {
            alert("Failed to fetch product details");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewPackage = async (id, snapshot = null) => {
        if (snapshot) {
            setDetailPackage({ ...snapshot, isSnapshot: true });
            return;
        }
        setDetailLoading(true);
        try {
            const response = await api.get(`/admin/boost-packages/${id}`);
            setDetailUser(null); // Close others
            setDetailProduct(null);
            setDetailPackage(response.data.data.boostPackage);
        } catch (err) {
            alert("Failed to fetch package details");
        } finally {
            setDetailLoading(false);
        }
    };

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
            handleVerify(id, 'rejected', null, reason);
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
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">User ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">Product ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">Package ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Transaction ID</th>
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
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-xs font-mono text-neutral-500">#{req.userId || 'N/A'}</span>
                                            <button
                                                onClick={() => handleViewUser(req.userId, view === 'history' ? { id: req.userId, email: req.userEmail, name: req.userFullName } : null)}
                                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-blue-600 transition-colors"
                                            >
                                                <User size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-xs font-mono text-neutral-500">#{req.productId || 'N/A'}</span>
                                            <button
                                                onClick={() => handleViewProduct(req.productId, view === 'history' ? { id: req.productId, name: req.productName, price: req.productPrice } : null)}
                                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-emerald-600 transition-colors"
                                            >
                                                <Package size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-xs font-mono text-neutral-500">#{view === 'history' ? (req.packageId || 'Snap') : (req.packageId || 'N/A')}</span>
                                            <button
                                                onClick={() => handleViewPackage(req.packageId, view === 'history' ? { id: req.packageId, name: req.packageName, durationHours: req.packageDurationHours, price: req.paidAmount } : null)}
                                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-amber-600 transition-colors"
                                            >
                                                <Zap size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className="text-neutral-400" />
                                            <span className="text-xs font-bold text-neutral-600">
                                                {view === 'history' ? req.paidAmount : (req.package?.price || 0)} ETB
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <code className="px-2 py-1 bg-neutral-100 rounded text-[10px] font-mono text-neutral-500">
                                            {req.transactionId}
                                        </code>
                                    </td>
                                    <td className="px-6 py-5">
                                        {req.startTime ? (
                                            <div className="text-[10px] text-neutral-600 font-medium">
                                                <p>{new Date(req.startTime).toLocaleDateString()}</p>
                                                <p className="text-neutral-400">{new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-neutral-400 italic">Immediate</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                            req.status === 'pending' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                            req.status === 'approved' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                                            req.status === 'rejected' && "bg-red-500/10 text-red-600 border-red-500/20",
                                        )}>
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
            {/* Detail Modals */}
            {(detailUser || detailLoading) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#0a0a0a]">User Details</h3>
                            <button onClick={() => setDetailUser(null)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {detailLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-neutral-400" size={32} />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                                            <User size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold text-[#0a0a0a]">{detailUser.name || `${detailUser.first_name} ${detailUser.last_name}`}</p>
                                            <p className="text-sm text-neutral-400 font-medium tracking-tight">
                                                User ID: #{detailUser.id} {detailUser.isSnapshot && <span className="ml-2 text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">Snapshot</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-neutral-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400">
                                                <Mail size={16} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email Address</p>
                                                <p className="text-sm font-semibold text-[#0a0a0a]">{detailUser.email}</p>
                                            </div>
                                        </div>
                                        {(detailUser.phone || detailUser.phone_number) && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400">
                                                    <Phone size={16} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Phone Number</p>
                                                    <p className="text-sm font-semibold text-[#0a0a0a]">{detailUser.phone || detailUser.phone_number}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(detailProduct || detailLoading) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#0a0a0a]">
                                {detailProduct?.isSnapshot ? 'Historical Snapshot' : 'Product Details'}
                            </h3>
                            <button onClick={() => setDetailProduct(null)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8">
                            {detailLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-neutral-400" size={32} />
                                </div>
                            ) : (
                                <div className="flex gap-6">
                                    <div className="w-32 h-32 rounded-2xl bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200 shrink-0">
                                        {detailProduct.images?.[0] ? (
                                            <img src={`${import.meta.env.VITE_BACKEND}${detailProduct.images[0]}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={40} className="text-neutral-400" />
                                        )}
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Tag size={12} className="text-blue-500" />
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{detailProduct.category || 'Standard'}</span>
                                            </div>
                                            <p className="text-lg font-bold text-[#0a0a0a] leading-tight line-clamp-2">{detailProduct.name}</p>
                                            <p className="text-sm text-neutral-400 font-medium mt-1">ID: #{detailProduct.id}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Market Price</p>
                                            <p className="text-2xl font-black text-emerald-700 tracking-tight">{detailProduct.price} ETB</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {detailPackage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#0a0a0a]">Package Details</h3>
                            <button onClick={() => setDetailPackage(null)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
                                    <Zap size={28} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-[#0a0a0a]">{detailPackage.name}</p>
                                    <p className="text-sm text-neutral-400 font-medium tracking-tight">Package ID: #{detailPackage.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-neutral-50 rounded-2xl space-y-1">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Duration</p>
                                    <p className="text-lg font-bold text-[#0a0a0a]">
                                        {detailPackage.durationHours >= 24 ? `${Math.floor(detailPackage.durationHours / 24)}d` : `${detailPackage.durationHours}h`}
                                    </p>
                                </div>
                                <div className="p-4 bg-neutral-50 rounded-2xl space-y-1">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5"><CreditCard size={10} /> Cost</p>
                                    <p className="text-lg font-bold text-[#0a0a0a]">{detailPackage.price} ETB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoostRequestManagement;

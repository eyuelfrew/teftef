import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Tag, Calendar, User, DollarSign, Package, AlertCircle, Trash2, Loader2, Phone } from 'lucide-react';
import api from '../../services/api';
import { cn } from '../../utils/cn';

const ProductDetailModal = ({ isOpen, onClose, product, onDelete }) => {
    const [poster, setPoster] = useState(null);
    const [loadingPoster, setLoadingPoster] = useState(false);

    useEffect(() => {
        const fetchPoster = async () => {
            if (isOpen && product?.id) {
                setLoadingPoster(true);
                try {
                    const res = await api.get(`/products/${product.id}/poster`);
                    setPoster(res.data.data.user);
                } catch (err) {
                    console.error("Failed to fetch poster", err);
                    setPoster(null);
                } finally {
                    setLoadingPoster(false);
                }
            } else {
                setPoster(null);
            }
        };

        fetchPoster();
    }, [isOpen, product?.id]);

    if (!isOpen || !product) return null;

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300" />
            <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
                <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden pointer-events-auto flex flex-col animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[#0a0a0a]">{product.name}</h2>
                                <p className="text-sm text-neutral-400">Product Details & Oversight</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-[#0a0a0a] transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left: Images & Basic Info */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {(product.images && product.images.length > 0) ? (
                                        product.images.map((img, idx) => (
                                            <div key={idx} className={cn(
                                                "aspect-square rounded-3xl border border-neutral-100 overflow-hidden bg-neutral-50",
                                                idx === 0 && "col-span-2"
                                            )}>
                                                <img src={`${import.meta.env.VITE_BACKEND}${img}`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 aspect-video rounded-3xl bg-neutral-50 flex items-center justify-center border-2 border-dashed border-neutral-200 text-neutral-400 font-medium">
                                            No Images Available
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-neutral-50 rounded-3xl space-y-4">
                                    <h3 className="font-bold text-lg text-[#0a0a0a]">Description</h3>
                                    <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {product.description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Specifications & Metadata */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Price</p>
                                        <p className="text-xl font-black text-[#0a0a0a]">ETB {parseFloat(product.price).toLocaleString()}</p>
                                    </div>
                                    <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Stock</p>
                                        <p className="text-xl font-black text-[#0a0a0a]">{product.stock} Units</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-[#0a0a0a] flex items-center gap-2">
                                        <AlertCircle size={20} className="text-neutral-400" />
                                        Specifications
                                    </h3>
                                    <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden divide-y divide-neutral-50 text-sm">
                                        <div className="px-6 py-4 flex justify-between">
                                            <span className="text-neutral-400 font-medium">Category</span>
                                            <span className="font-bold text-[#0a0a0a]">{product.category || 'Uncategorized'}</span>
                                        </div>
                                        <div className="px-6 py-4 flex justify-between">
                                            <span className="text-neutral-400 font-medium">Brand</span>
                                            <span className="font-bold text-[#0a0a0a]">{product.brand || 'N/A'}</span>
                                        </div>
                                        <div className="px-6 py-4 flex justify-between">
                                            <span className="text-neutral-400 font-medium">Status</span>
                                            <span className={cn(
                                                "font-bold uppercase tracking-tighter",
                                                product.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                                            )}>{product.status}</span>
                                        </div>
                                        <div className="px-6 py-4 flex justify-between">
                                            <span className="text-neutral-400 font-medium">Posted Date</span>
                                            <span className="font-bold text-[#0a0a0a]">{new Date(product.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {product.metadata && Object.keys(product.metadata).length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-[#0a0a0a] flex items-center gap-2">
                                            <Package size={20} className="text-neutral-400" />
                                            Attributes
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(product.metadata).map(([key, value]) => (
                                                <div key={key} className="p-4 bg-[#fafafa] border border-neutral-50 rounded-2xl">
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                                                    <p className="text-sm font-bold text-[#0a0a0a]">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {loadingPoster ? (
                                    <div className="flex items-center justify-center py-6 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                                        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                                        <span className="ml-2 text-sm text-neutral-400">Loading poster details...</span>
                                    </div>
                                ) : poster ? (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-[#0a0a0a] flex items-center gap-2">
                                            <User size={20} className="text-neutral-400" />
                                            Poster Information
                                        </h3>
                                        <div className="p-6 bg-neutral-900 rounded-3xl text-white shadow-xl">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl overflow-hidden border border-white/10">
                                                        {poster.profile_pic ? (
                                                            <img src={poster.profile_pic} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            poster.first_name?.[0] || 'U'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{poster.first_name} {poster.last_name}</p>
                                                        <p className="text-sm text-white/50">{poster.email}</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                                    Verified Seller
                                                </div>
                                            </div>

                                            {poster.phone_number && (
                                                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                                        <Phone size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Phone Number</p>
                                                        <p className="text-sm font-bold">{poster.phone_number}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 flex items-center gap-3 text-neutral-400 italic text-sm">
                                        <AlertCircle size={18} />
                                        Poster information not available for this product.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-neutral-100 flex items-center justify-end gap-3 bg-neutral-50/50 shrink-0">
                        <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-neutral-500 hover:text-[#0a0a0a] transition-all">
                            Close Preview
                        </button>
                        <button
                            onClick={() => { onDelete(); onClose(); }}
                            className="px-6 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                        >
                            <Trash2 size={18} />
                            Remove Product
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetailModal;

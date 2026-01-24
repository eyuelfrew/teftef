import React from 'react';
import { X, User, Mail, Calendar, CheckCircle, XCircle, MicOff } from 'lucide-react';

const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const getStatusChip = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                        <CheckCircle size={12} /> ACTIVE
                    </span>
                );
            case 'inactive':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                        <XCircle size={12} /> INACTIVE
                    </span>
                );
            case 'posting_banned':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100">
                        <MicOff size={12} /> POSTING BAN
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8 m-4 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 border border-neutral-200 overflow-hidden">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={`${user.first_name} ${user.last_name}`} className="w-full h-full object-cover" />
                            ) : (
                                <User size={32} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#0a0a0a]">{user.first_name} {user.last_name}</h2>
                            <p className="text-sm text-neutral-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100">
                        <X size={20} className="text-neutral-500" />
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="bg-neutral-50/70 p-4 rounded-xl">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Status</p>
                        <div className="mt-2">{getStatusChip(user.status)}</div>
                    </div>
                    <div className="bg-neutral-50/70 p-4 rounded-xl">
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Registration Date</p>
                        <p className="mt-2 font-semibold text-[#0a0a0a]">{new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    {/* Add more user details here as needed */}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;

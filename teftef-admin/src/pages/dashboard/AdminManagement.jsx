import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Users,
    UserPlus,
    Trash2,
    Edit2,
    Shield,
    User,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import AdminModal from '../../components/ui/AdminModal';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);

    const fetchAdmins = async () => {
        try {
            const response = await api.get('/admin/management');
            setAdmins(response.data.data.admins);
        } catch (err) {
            setError('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleSaveAdmin = async (formData) => {
        if (editingAdmin) {
            await api.patch(`/admin/management/${editingAdmin.id}`, formData);
        } else {
            await api.post('/admin/management', formData);
        }
        await fetchAdmins();
    };

    const handleDeleteAdmin = async (id) => {
        if (window.confirm('Are you sure you want to delete this administrator?')) {
            try {
                await api.delete(`/admin/management/${id}`);
                await fetchAdmins();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete admin');
            }
        }
    };

    const openCreateModal = () => {
        setEditingAdmin(null);
        setIsModalOpen(true);
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
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
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">Admin Management</h1>
                    <p className="text-neutral-500 mt-1">Manage platform administrators and permissions.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-black/5 group"
                >
                    <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                    Add New Admin
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Administrator</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Role</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Status</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Created At</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400 text-right" style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 border border-neutral-200">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#0a0a0a]">{admin.first_name} {admin.last_name}</p>
                                                <p className="text-xs text-neutral-400">{admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {admin.is_super_admin ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                <Shield size={12} />
                                                SUPER ADMIN
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold border border-neutral-200">
                                                ADMIN
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {admin.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                <CheckCircle size={12} />
                                                ACTIVE
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                                                <XCircle size={12} />
                                                DISABLED
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-500">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(admin)}
                                                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAdmin}
                admin={editingAdmin}
            />
        </div>
    );
};

export default AdminManagement;


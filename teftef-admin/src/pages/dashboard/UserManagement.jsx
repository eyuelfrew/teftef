import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Trash2,
    User,
    CheckCircle,
    XCircle,
    Loader2,
    MicOff,
    UserX,
    Search,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import UserDetailModal from '../../components/ui/UserDetailModal';

const sampleUsers = [
    {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        status: 'active',
        createdAt: new Date('2023-01-15T10:00:00Z'),
        profile_picture: 'https://i.pravatar.cc/150?img=1'
    },
    {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        status: 'inactive',
        createdAt: new Date('2023-03-20T11:30:00Z'),
        profile_picture: 'https://i.pravatar.cc/150?img=2'
    },
    {
        id: '3',
        first_name: 'Peter',
        last_name: 'Jones',
        email: 'peter.jones@example.com',
        status: 'active',
        createdAt: new Date('2023-05-01T14:45:00Z'),
        profile_picture: 'https://i.pravatar.cc/150?img=3'
    },
    {
        id: '4',
        first_name: 'Alice',
        last_name: 'Brown',
        email: 'alice.brown@example.com',
        status: 'posting_banned',
        createdAt: new Date('2023-07-10T08:00:00Z'),
        profile_picture: 'https://i.pravatar.cc/150?img=4'
    },
    {
        id: '5',
        first_name: 'Bob',
        last_name: 'White',
        email: 'bob.white@example.com',
        status: 'inactive',
        createdAt: new Date('2023-09-25T09:15:00Z'),
        profile_picture: 'https://i.pravatar.cc/150?img=5'
    },
];

const SortableHeader = ({ children, sortKey, sortConfig, onSort }) => {
    const isSorted = sortConfig.key === sortKey;
    const isAsc = sortConfig.direction === 'ascending';

    return (
        <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400 cursor-pointer" onClick={() => onSort(sortKey)}>
            <div className="flex items-center gap-1">
                {children}
                {isSorted ? (isAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : null}
            </div>
        </th>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    const fetchUsers = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUsers(sampleUsers);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this user account?')) {
            console.log('Deleting user with ID:', id);
            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        }
    };

    const handleBanFromPosting = (id) => {
        console.log('Banning user from posting with ID:', id);
        setUsers(prevUsers => prevUsers.map(user =>
            user.id === id ? { ...user, status: user.status === 'posting_banned' ? 'active' : 'posting_banned' } : user
        ));
    };

    const handleDeactivateUser = (id) => {
        if (window.confirm('Are you sure you want to deactivate this user account?')) {
            console.log('Deactivating user with ID:', id);
            setUsers(prevUsers => prevUsers.map(user =>
                user.id === id ? { ...user, status: user.status === 'inactive' ? 'active' : 'inactive' } : user
            ));
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setDetailModalOpen(true);
    };

    const filteredAndSortedUsers = useMemo(() => {
        let sortedUsers = [...users];

        if (sortConfig.key) {
            sortedUsers.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'createdAt') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        if (searchQuery) {
            return sortedUsers.filter(user =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return sortedUsers;
    }, [users, searchQuery, sortConfig]);

    if (loading) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">User Management</h1>
                    <p className="text-neutral-500 mt-1">View, search, sort, and manage platform users.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2 w-full text-sm focus:ring-2 focus:ring-[#0a0a0a] transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/50">
                                <SortableHeader sortKey="first_name" sortConfig={sortConfig} onSort={handleSort}>User</SortableHeader>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Status</th>
                                <SortableHeader sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort}>Registered At</SortableHeader>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400 text-right" style={{ width: '160px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filteredAndSortedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors cursor-pointer" onClick={() => handleRowClick(user)}>
                                                                         <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 border border-neutral-200 overflow-hidden">
                                                                                    {user.profile_picture ? (
                                                                                        <img src={user.profile_picture} alt={`${user.first_name} ${user.last_name}`} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <User size={18} />
                                                                                    )}
                                                                                </div>
                                                                                <div>                                                <p className="font-semibold text-[#0a0a0a]">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs text-neutral-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.status === 'active' && (<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100"><CheckCircle size={12} />ACTIVE</span>)}
                                        {user.status === 'inactive' && (<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100"><XCircle size={12} />INACTIVE</span>)}
                                        {user.status === 'posting_banned' && (<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100"><MicOff size={12} />POSTING BAN</span>)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleBanFromPosting(user.id)} className="p-2 text-neutral-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all" title={user.status === 'posting_banned' ? 'Unban User' : 'Ban from Posting'}><MicOff size={16} /></button>
                                            <button onClick={() => handleDeactivateUser(user.id)} className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title={user.status === 'inactive' ? 'Activate User' : 'Deactivate Account'}><UserX size={16} /></button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete User Permanently"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <UserDetailModal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} user={selectedUser} />
        </div>
    );
};

export default UserManagement;

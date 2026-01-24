import React, { useState, useEffect, useMemo } from 'react';
import {
    ShoppingBag,
    Trash2,
    Eye,
    User,
    CheckCircle,
    XCircle,
    Loader2,
    Search,
    ArrowUp,
    ArrowDown,
    LayoutGrid,
    ExternalLink,
    Calendar,
    Tag
} from 'lucide-react';
import api from '../../services/api';
import ProductDetailModal from '../../components/ui/ProductDetailModal';
import UserDetailModal from '../../components/ui/UserDetailModal';

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

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'ascending' });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 10 });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setUserModalOpen] = useState(false);

    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/products?page=${page}&limit=${pagination.limit}`);
            setProducts(res.data.data.products);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch products", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(pagination.currentPage);
    }, [pagination.currentPage]);

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
            } catch (err) {
                console.error("Failed to delete product", err);
                alert("Failed to delete product.");
            }
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

    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setDetailModalOpen(true);
    };

    const handleViewUser = (e, user) => {
        e.stopPropagation();
        if (user) {
            setSelectedUser(user);
            setUserModalOpen(true);
        }
    };

    const filteredAndSortedProducts = useMemo(() => {
        let sortedProducts = [...products];

        if (sortConfig.key) {
            sortedProducts.sort((a, b) => {
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
            return sortedProducts.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return sortedProducts;
    }, [products, searchQuery, sortConfig]);

    if (loading && products.length === 0) {
        return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0a0a0a] flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8" />
                        Product Management
                    </h1>
                    <p className="text-neutral-500 mt-1">Manage platform products, view details, and posters.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
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
                                <SortableHeader sortKey="name" sortConfig={sortConfig} onSort={handleSort}>Product</SortableHeader>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Category</th>
                                <SortableHeader sortKey="price" sortConfig={sortConfig} onSort={handleSort}>Price</SortableHeader>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Poster</th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400">Status</th>
                                <SortableHeader sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort}>Date</SortableHeader>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-neutral-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filteredAndSortedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors cursor-pointer" onClick={() => handleRowClick(product)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 border border-neutral-200 overflow-hidden shrink-0">
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={`${import.meta.env.VITE_BACKEND}${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingBag size={20} />
                                                )}
                                            </div>
                                            <div className="max-w-[200px]">
                                                <p className="font-semibold text-[#0a0a0a] truncate">{product.name}</p>
                                                <p className="text-xs text-neutral-400 truncate">ID: {product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                                            <Tag size={14} className="text-neutral-400" />
                                            {product.category || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#0a0a0a]">
                                        ETB {parseFloat(product.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.user ? (
                                            <button
                                                onClick={(e) => handleViewUser(e, product.user)}
                                                className="flex items-center gap-2 hover:bg-neutral-100 px-2 py-1 rounded-lg transition-all group"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs overflow-hidden">
                                                    {product.user.profile_pic ? (
                                                        <img src={product.user.profile_pic} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={14} />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-neutral-700 group-hover:text-[#0a0a0a]">{product.user.first_name}</span>
                                            </button>
                                        ) : (
                                            <span className="text-sm text-neutral-400">Unknown</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.status === 'active' && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 uppercase tracking-wider">Active</span>)}
                                        {product.status === 'draft' && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold border border-yellow-100 uppercase tracking-wider">Draft</span>)}
                                        {product.status === 'archived' && (<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-50 text-neutral-700 text-[10px] font-bold border border-neutral-100 uppercase tracking-wider">Archived</span>)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-500">
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleRowClick(product)} className="p-2 text-neutral-400 hover:text-[#0a0a0a] hover:bg-neutral-100 rounded-lg transition-all" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Product"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 border-t border-neutral-50 flex items-center justify-between bg-white">
                    <p className="text-sm text-neutral-500">
                        Showing <span className="font-bold text-[#0a0a0a]">{products.length}</span> of <span className="font-bold text-[#0a0a0a]">{pagination.totalResults}</span> products
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.currentPage === 1 || loading}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-40 transition-all"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1 px-2">
                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${pagination.currentPage === i + 1
                                        ? 'bg-[#0a0a0a] text-white shadow-lg shadow-black/10'
                                        : 'text-neutral-400 hover:text-[#0a0a0a] hover:bg-neutral-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={pagination.currentPage === pagination.totalPages || loading}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-40 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <ProductDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                product={selectedProduct}
                onDelete={() => handleDeleteProduct(selectedProduct?.id)}
            />

            <UserDetailModal
                isOpen={isUserModalOpen}
                onClose={() => setUserModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};

export default ProductManagement;

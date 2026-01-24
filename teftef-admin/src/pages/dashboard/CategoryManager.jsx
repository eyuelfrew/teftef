import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    FolderTree,
    Plus,
    ChevronRight,
    ChevronDown,
    Edit2,
    Trash2,
    MoreHorizontal,
    Image as ImageIcon,
    X,
    Folder,
    Link as LinkIcon,
    Upload as UploadIcon
} from 'lucide-react';
import { cn } from '../../utils/cn';

const BASE_URL = import.meta.env.VITE_BACKEND || 'http://localhost:5000';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('//')) return path;
    return `${BASE_URL}${path}`;
};

// Recursive Tree Item Component
const TreeItem = ({ node, level, onEdit, onDelete, onAddSub, expandedNodes, toggleExpand }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
        <div className="select-none">
            <div
                className={cn(
                    "flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors group",
                    level === 0 ? "mb-1" : "ml-6 border-l border-neutral-100" // Indent
                )}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(node.id);
                        }}
                        className={cn(
                            "p-1 rounded-lg hover:bg-neutral-200 transition-colors",
                            !hasChildren && "invisible"
                        )}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                        {node.image ? (
                            <img src={getImageUrl(node.image)} alt={node.name} className="w-full h-full object-cover" />
                        ) : (
                            <Folder size={16} className="text-neutral-400" />
                        )}
                    </div>

                    <div>
                        <span className="font-semibold text-[#0a0a0a]">{node.name}</span>
                        {/* <span className="text-xs text-neutral-400 ml-2">Level {node.level}</span> */}
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onAddSub(node)}
                        className="p-1.5 text-neutral-500 hover:text-[#0a0a0a] hover:bg-neutral-200 rounded-lg"
                        title="Add Sub-category"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(node)}
                        className="p-1.5 text-neutral-500 hover:text-[#0a0a0a] hover:bg-neutral-200 rounded-lg"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(node.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    {node.children.map(child => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                            expandedNodes={expandedNodes}
                            toggleExpand={toggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryManager = () => {
    const [tree, setTree] = useState([]);
    const [flatCategories, setFlatCategories] = useState([]); // For parent dropdown
    const [loading, setLoading] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        parentId: '',
        description: '',
        color: '#000000',
        displayOrder: 0,
        imageUrl: ''
    });

    useEffect(() => {
        fetchTree();
        fetchFlatList();
    }, []);

    const fetchTree = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories/tree');
            setTree(res.data.data.categories);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFlatList = async () => {
        try {
            const res = await api.get('/categories'); // The flat list endpoint
            setFlatCategories(res.data.data.categories);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleExpand = (id) => {
        const newSet = new Set(expandedNodes);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedNodes(newSet);
    };

    const handleOpenCreate = (parentNode = null) => {
        setModalMode('create');
        setFormData({
            id: null,
            name: '',
            parentId: parentNode ? parentNode.id : '',
            description: '',
            color: '#000000',
            displayOrder: 0,
            imageUrl: ''
        });
        setImageMode('upload');
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowModal(true);

        // If adding sub to parent, expand parent
        if (parentNode) {
            const newSet = new Set(expandedNodes);
            newSet.add(parentNode.id);
            setExpandedNodes(newSet);
        }
    };

    const handleOpenEdit = (node) => {
        setModalMode('edit');
        setFormData({
            id: node.id,
            name: node.name,
            parentId: node.parentId || '',
            description: node.description || '',
            color: node.color || '#000000',
            displayOrder: node.displayOrder || 0,
            imageUrl: (node.image && (node.image.startsWith('http') || node.image.startsWith('//'))) ? node.image : ''
        });

        if (node.image && (node.image.startsWith('http') || node.image.startsWith('//'))) {
            setImageMode('url');
            setPreviewUrl(node.image);
        } else {
            setImageMode('upload');
            setPreviewUrl(getImageUrl(node.image));
        }

        setSelectedFile(null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category? If it has sub-categories, delete them first.")) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchTree();
            fetchFlatList();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete. Ensure it has no children.");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, imageUrl: url });
        setPreviewUrl(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        if (formData.parentId) data.append('parentId', formData.parentId);
        data.append('description', formData.description);
        data.append('color', formData.color);
        data.append('displayOrder', formData.displayOrder);

        if (imageMode === 'upload' && selectedFile) {
            data.append('image', selectedFile);
        } else if (imageMode === 'url' && formData.imageUrl) {
            data.append('image', formData.imageUrl);
        }

        try {
            if (modalMode === 'create') {
                await api.post('/categories', data);
            } else {
                await api.patch(`/categories/${formData.id}`, data);
            }
            setShowModal(false);
            fetchTree();
            fetchFlatList();
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save category");
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            <div className="flex-1 bg-white rounded-3xl border border-neutral-100 flex flex-col overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#0a0a0a] flex items-center gap-2">
                            <FolderTree className="w-5 h-5" />
                            Category Tree
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">Organize your product hierarchy</p>
                    </div>
                    <button
                        onClick={() => handleOpenCreate(null)} // Root
                        className="flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-all font-medium shadow-lg shadow-black/5"
                    >
                        <Plus size={18} />
                        Add Root Category
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-10 text-neutral-400">Loading hierarchy...</div>
                    ) : tree.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400">
                            No categories found. Start by adding a root category.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tree.map(node => (
                                <TreeItem
                                    key={node.id}
                                    node={node}
                                    level={0}
                                    onEdit={handleOpenEdit}
                                    onDelete={handleDelete}
                                    onAddSub={handleOpenCreate}
                                    expandedNodes={expandedNodes}
                                    toggleExpand={toggleExpand}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/5 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-neutral-100 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#0a0a0a]">
                                {modalMode === 'create' ? 'New Category' : 'Edit Category'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-neutral-600">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0a0a0a]"
                                    placeholder="e.g. Electronics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-neutral-600">Parent Category</label>
                                <select
                                    value={formData.parentId}
                                    onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0a0a0a] appearance-none"
                                >
                                    <option value="">No Parent (Root)</option>
                                    {flatCategories
                                        .filter(c => c.id !== formData.id) // Prevent selecting self as parent
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2 text-neutral-600">Icon / Image</label>


                                    <div className="flex gap-2 mb-3 bg-neutral-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setImageMode('upload'); setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null); }}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all",
                                                imageMode === 'upload' ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                            )}
                                        >
                                            <UploadIcon size={14} /> Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setImageMode('url'); setPreviewUrl(formData.imageUrl || null); }}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all",
                                                imageMode === 'url' ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                            )}
                                        >
                                            <LinkIcon size={14} /> URL
                                        </button>
                                    </div>

                                    {imageMode === 'upload' ? (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="cat-icon"
                                            />
                                            <label
                                                htmlFor="cat-icon"
                                                className="flex items-center gap-3 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-neutral-100 transition-colors"
                                            >
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className="w-6 h-6 rounded object-cover" />
                                                ) : (
                                                    <ImageIcon size={20} className="text-neutral-400" />
                                                )}
                                                <span className="text-sm text-neutral-500">
                                                    {selectedFile ? selectedFile.name : "Choose File..."}
                                                </span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className="w-5 h-5 rounded object-cover" />
                                                ) : (
                                                    <ImageIcon size={18} className="text-neutral-400" />
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.imageUrl}
                                                onChange={handleUrlChange}
                                                placeholder="https://example.com/image.png"
                                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#0a0a0a]"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-neutral-600">Color</label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="h-[46px] w-[60px] block bg-neutral-50 border border-neutral-200 rounded-xl p-1 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#0a0a0a] text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-all mt-4"
                            >
                                {modalMode === 'create' ? 'Create Category' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;

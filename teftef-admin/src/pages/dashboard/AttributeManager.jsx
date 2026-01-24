import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    LayoutList,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    ChevronRight,
    Tag,
    Type,
    List,
    Hash,
    Search
} from 'lucide-react';
import { cn } from '../../utils/cn';

const AttributeManager = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        field_label: '',
        field_type: 'text',
        field_options: [],
        is_required: false
    });
    const [optionInput, setOptionInput] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchAttributes(selectedCategory.id);
        } else {
            setAttributes([]);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            const allCats = res.data.data.categories || [];

            // 1. Map for easy lookup & 2. Identify Parents
            const catMap = {};
            const parentIds = new Set();

            allCats.forEach(cat => {
                catMap[cat.id] = cat;
                if (cat.parentId) {
                    parentIds.add(String(cat.parentId)); // Encode as string for safety
                }
            });

            // 3. Filter Leaves & Build Breadcrumbs
            const leaves = allCats.filter(cat => {
                // Determine if this is a leaf: partial leaves (roots with no kids) or true leaves
                return !parentIds.has(String(cat.id));
            }).map(leaf => {
                let path = leaf.name;
                let current = leaf;
                while (current.parentId && catMap[current.parentId]) {
                    current = catMap[current.parentId];
                    path = `${current.name} > ${path}`;
                }
                return { ...leaf, displayName: path };
            });

            // Sort alphabetically by full path
            leaves.sort((a, b) => a.displayName.localeCompare(b.displayName));

            setCategories(leaves);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchAttributes = async (catId) => {
        setLoading(true);
        try {
            const res = await api.get(`/attributes/${catId}`);
            setAttributes(res.data.data.attributes);
        } catch (err) {
            console.error("Failed to fetch attributes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOption = (e) => {
        e.preventDefault();
        if (!optionInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            field_options: [...prev.field_options, optionInput.trim()]
        }));
        setOptionInput('');
    };

    const removeOption = (index) => {
        setFormData(prev => ({
            ...prev,
            field_options: prev.field_options.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCategory || !formData.field_label) return;

        setCreating(true);
        try {
            await api.post('/attributes', {
                category_id: selectedCategory.id,
                ...formData
            });
            setShowForm(false);
            setFormData({
                field_label: '',
                field_type: 'text',
                field_options: [],
                is_required: false
            });
            fetchAttributes(selectedCategory.id);
        } catch (err) {
            console.error("Failed to create attribute", err);
            alert("Failed to create attribute");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove this attribute from all future products.")) return;
        try {
            await api.delete(`/attributes/${id}`);
            setAttributes(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'number': return <Hash size={16} />;
            case 'dropdown': return <List size={16} />;
            default: return <Type size={16} />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Left Sidebar: Categories */}
            <div className="w-1/3 bg-white rounded-3xl border border-neutral-100 flex flex-col overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-100 space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#0a0a0a] flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            Categories
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">Select a category to manage attributes</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {categories
                        .filter(cat =>
                            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cat.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setShowForm(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all",
                                    selectedCategory?.id === cat.id
                                        ? "bg-[#0a0a0a] text-white shadow-md"
                                        : "hover:bg-neutral-50 text-neutral-600"
                                )}
                            >
                                <div>
                                    <span className="font-medium block">{cat.name}</span>
                                    <span className={cn("text-xs block mt-1", selectedCategory?.id === cat.id ? "text-neutral-400" : "text-neutral-400")}>
                                        {cat.displayName.split(' > ').slice(0, -1).join(' > ')}
                                    </span>
                                </div>
                                {selectedCategory?.id === cat.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                    {categories.filter(cat =>
                        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        cat.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                            <div className="p-8 text-center text-neutral-400">
                                {categories.length === 0 ? "No categories found." : "No matches found."}
                            </div>
                        )}
                </div>
            </div>

            {/* Main Content: Attributes */}
            <div className="flex-1 bg-white rounded-3xl border border-neutral-100 flex flex-col overflow-hidden shadow-sm">
                {selectedCategory ? (
                    <>
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-[#0a0a0a]">
                                    Attributes for "{selectedCategory.name}"
                                </h2>
                                <p className="text-sm text-neutral-400 mt-1">
                                    {attributes.length} custom fields configured
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-all font-medium shadow-lg shadow-black/5"
                            >
                                <Plus size={18} />
                                Add Attribute
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {showForm && (
                                <div className="mb-8 bg-neutral-50 rounded-2xl p-6 border border-neutral-100 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg">New Attribute</h3>
                                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-neutral-600">Field Label</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.field_label}
                                                    onChange={e => setFormData({ ...formData, field_label: e.target.value })}
                                                    placeholder="e.g. Storage, Size, Material"
                                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-neutral-600">Input Type</label>
                                                <select
                                                    value={formData.field_type}
                                                    onChange={e => setFormData({ ...formData, field_type: e.target.value })}
                                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a] transition-all appearance-none"
                                                >
                                                    <option value="text">Text Input</option>
                                                    <option value="number">Number Input</option>
                                                    <option value="dropdown">Dropdown Selection</option>
                                                </select>
                                            </div>
                                        </div>

                                        {formData.field_type === 'dropdown' && (
                                            <div className="bg-white p-4 rounded-xl border border-neutral-200">
                                                <label className="block text-sm font-medium mb-3 text-neutral-600">Dropdown Options</label>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={optionInput}
                                                        onChange={e => setOptionInput(e.target.value)}
                                                        placeholder="Type option and press Enter"
                                                        onKeyDown={e => e.key === 'Enter' && handleAddOption(e)}
                                                        className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#0a0a0a]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddOption}
                                                        className="bg-neutral-100 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.field_options.map((opt, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 bg-neutral-100 px-3 py-1 rounded-full text-sm font-medium">
                                                            {opt}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeOption(idx)}
                                                                className="hover:text-red-500"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    {formData.field_options.length === 0 && (
                                                        <span className="text-sm text-neutral-400 italic">No options added yet.</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="req"
                                                checked={formData.is_required}
                                                onChange={e => setFormData({ ...formData, is_required: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-300 text-[#0a0a0a] focus:ring-[#0a0a0a]"
                                            />
                                            <label htmlFor="req" className="text-sm font-medium text-neutral-700">Required Field</label>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                                            <button
                                                type="button"
                                                onClick={() => setShowForm(false)}
                                                className="px-6 py-2 rounded-xl font-medium text-neutral-500 hover:text-[#0a0a0a] hover:bg-neutral-100 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={creating}
                                                className="px-8 py-2 bg-[#0a0a0a] text-white rounded-xl font-medium hover:bg-neutral-800 transition-all disabled:opacity-50"
                                            >
                                                {creating ? 'Creating...' : 'Create Attribute'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-10 text-neutral-400">Loading attributes...</div>
                                ) : attributes.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                                        <LayoutList size={48} className="mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No attributes defined yet</p>
                                        <p className="text-sm">Click "Add Attribute" to define custom fields for this category.</p>
                                    </div>
                                ) : (
                                    attributes.map((attr) => (
                                        <div key={attr.id} className="group bg-white border border-neutral-100 p-5 rounded-2xl flex items-center justify-between hover:border-[#0a0a0a]/20 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-500">
                                                    {getTypeIcon(attr.field_type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#0a0a0a]">{attr.field_label}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs uppercase tracking-wider font-bold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded">
                                                            {attr.field_type}
                                                        </span>
                                                        {attr.is_required && (
                                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                                                Required
                                                            </span>
                                                        )}
                                                        {attr.field_type === 'dropdown' && (
                                                            <span className="text-xs text-neutral-400 px-1">
                                                                {attr.field_options?.length || 0} options
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(attr.id)}
                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                        <Tag size={64} className="mb-6 opacity-10" />
                        <h3 className="text-xl font-bold text-neutral-300">No Category Selected</h3>
                        <p className="max-w-xs text-center mt-2 text-neutral-400">Select a category from the sidebar to manage its dynamic attributes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttributeManager;

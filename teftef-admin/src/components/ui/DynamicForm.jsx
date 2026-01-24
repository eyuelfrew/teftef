import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Layers,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Code,
    Smartphone,
    ArrowRight
} from 'lucide-react';

const DynamicForm = () => {
    // Category Data
    const [tree, setTree] = useState([]);
    const [loadingTree, setLoadingTree] = useState(true);

    // Selection State
    const [selectedRoot, setSelectedRoot] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [selectedLeaf, setSelectedLeaf] = useState(null);

    // Attributes Data
    const [attributes, setAttributes] = useState([]);
    const [loadingAttrs, setLoadingAttrs] = useState(false);

    // Form Values
    const [formValues, setFormValues] = useState({});

    // Fetch Category Tree on Mount
    useEffect(() => {
        fetchTree();
    }, []);

    // Fetch Attributes when Leaf is selected
    useEffect(() => {
        if (selectedLeaf) {
            fetchAttributes(selectedLeaf.id);
        } else {
            setAttributes([]);
            setFormValues({});
        }
    }, [selectedLeaf]);

    const fetchTree = async () => {
        try {
            const res = await api.get('/categories/tree');
            setTree(res.data.data.categories || []);
        } catch (err) {
            console.error("Failed to load category tree", err);
        } finally {
            setLoadingTree(false);
        }
    };

    const fetchAttributes = async (categoryId) => {
        setLoadingAttrs(true);
        try {
            const res = await api.get(`/attributes/${categoryId}`);
            setAttributes(res.data.data.attributes || []);
        } catch (err) {
            console.error("Failed to load attributes", err);
        } finally {
            setLoadingAttrs(false);
        }
    };

    const handleLevel1Change = (e) => {
        const catId = parseInt(e.target.value);
        const cat = tree.find(c => c.id === catId);
        setSelectedRoot(cat);
        setSelectedSub(null);
        setSelectedLeaf(null);
    };

    const handleLevel2Change = (e) => {
        const catId = parseInt(e.target.value);
        const cat = selectedRoot?.children?.find(c => c.id === catId);
        setSelectedSub(cat);
        setSelectedLeaf(null);
    };

    const handleLevel3Change = (e) => {
        const catId = parseInt(e.target.value);
        const cat = selectedSub?.children?.find(c => c.id === catId);
        setSelectedLeaf(cat);
    };

    const handleInputChange = (label, value) => {
        setFormValues(prev => ({
            ...prev,
            [label]: value
        }));
    };

    // Helper to render input based on type
    const renderInput = (attr) => {
        const commonClasses = "w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a] transition-all text-sm";

        switch (attr.field_type) {
            case 'dropdown':
                return (
                    <select
                        className={commonClasses}
                        onChange={(e) => handleInputChange(attr.field_label, e.target.value)}
                        value={formValues[attr.field_label] || ""}
                    >
                        <option value="">Select {attr.field_label}</option>
                        {Array.isArray(attr.field_options) && attr.field_options.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'number':
                return (
                    <input
                        type="number"
                        className={commonClasses}
                        placeholder={`Enter ${attr.field_label}`}
                        onChange={(e) => handleInputChange(attr.field_label, e.target.value)}
                        value={formValues[attr.field_label] || ""}
                    />
                );
            default: // text
                return (
                    <input
                        type="text"
                        className={commonClasses}
                        placeholder={`Enter ${attr.field_label}`}
                        onChange={(e) => handleInputChange(attr.field_label, e.target.value)}
                        value={formValues[attr.field_label] || ""}
                    />
                );
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* LEFT: Configuration & Inputs */}
            <div className="space-y-8">
                {/* 1. Hierarchy Selection */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                    <h2 className="font-bold text-[#0a0a0a] flex items-center gap-2">
                        <Layers size={20} />
                        Category Selection
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Root */}
                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Level 1 (Root)</label>
                            <select
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0a0a0a] outline-none transition-all"
                                onChange={handleLevel1Change}
                                value={selectedRoot?.id || ""}
                            >
                                <option value="">Select Root Category</option>
                                {tree.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sub */}
                        <div className={!selectedRoot ? "opacity-50 pointer-events-none" : ""}>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Level 2 (Sub-category)</label>
                            <select
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0a0a0a] outline-none transition-all"
                                onChange={handleLevel2Change}
                                value={selectedSub?.id || ""}
                            >
                                <option value="">Select Sub-category</option>
                                {selectedRoot?.children?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Leaf */}
                        <div className={!selectedSub ? "opacity-50 pointer-events-none" : ""}>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 block">Level 3 (Leaf)</label>
                            <select
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0a0a0a] outline-none transition-all"
                                onChange={handleLevel3Change}
                                value={selectedLeaf?.id || ""}
                            >
                                <option value="">Select Final Category</option>
                                {selectedSub?.children?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Dynamic Inputs */}
                {selectedLeaf && (
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <div>
                                <h2 className="font-bold text-[#0a0a0a] text-lg">{selectedLeaf.name} Specs</h2>
                                <p className="text-sm text-neutral-400">Dynamic fields for this category</p>
                            </div>
                            <span className="bg-[#0a0a0a] text-white text-xs font-bold px-3 py-1 rounded-full">
                                {attributes.length} Fields
                            </span>
                        </div>

                        {loadingAttrs ? (
                            <div className="py-10 text-center text-neutral-400">Loading attributes...</div>
                        ) : attributes.length === 0 ? (
                            <div className="py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                <AlertCircle className="mx-auto mb-2 text-neutral-300" />
                                <p className="text-neutral-500 font-medium">No custom attributes found.</p>
                                <p className="text-xs text-neutral-400 mt-1">Go to Attribute Manager to add some.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                {attributes.map(attr => (
                                    <div key={attr.id} className="group">
                                        <label className="block text-sm font-medium mb-2 text-neutral-600 group-focus-within:text-[#0a0a0a] transition-colors">
                                            {attr.field_label}
                                            {attr.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderInput(attr)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT: Mobile Preview & JSON */}
            <div className="space-y-8">
                {/* Mobile Preview Simulation */}
                <div className="bg-[#0a0a0a] p-4 rounded-[2.5rem] shadow-2xl mx-auto max-w-[320px] border-[8px] border-[#222]">
                    <div className="bg-white rounded-[2rem] h-[550px] overflow-hidden flex flex-col w-full relative">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#0a0a0a] rounded-b-xl z-20"></div>

                        {/* Status Bar */}
                        <div className="h-10 bg-neutral-100 w-full shrink-0"></div>

                        {/* App Content */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                            <div className="flex items-center gap-2 mb-6 text-[#0a0a0a]">
                                <ChevronRight className="rotate-180" size={20} />
                                <span className="font-bold">Add Details</span>
                            </div>

                            <div className="space-y-4">
                                {/* Static Fields Simulation */}
                                <div className="h-10 bg-neutral-100 rounded-lg w-full animate-pulse"></div>
                                <div className="h-24 bg-neutral-100 rounded-lg w-full animate-pulse"></div>
                                <div className="h-10 bg-neutral-100 rounded-lg w-2/3 animate-pulse"></div>

                                {/* Dynamic Fields Rendered Here */}
                                {Object.keys(formValues).length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-neutral-100">
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                                            {selectedLeaf?.name} Specs
                                        </p>
                                        <div className="space-y-3">
                                            {Object.entries(formValues).map(([key, val]) => (
                                                <div key={key} className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex justify-between items-center">
                                                    <span className="text-xs text-neutral-500 font-medium">{key}</span>
                                                    <span className="text-sm font-bold text-[#0a0a0a]">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="p-4 border-t border-neutral-100 bg-white/80 backdrop-blur">
                            <button className="w-full bg-[#0a0a0a] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-black/20">
                                Post Ad
                            </button>
                        </div>
                    </div>
                </div>

                {/* JSON Output */}
                <div className="bg-neutral-900 rounded-3xl p-6 shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between mb-4 text-white/50">
                        <div className="flex items-center gap-2">
                            <Code size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">JSON Metadata Payload</span>
                        </div>
                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded">Read-only</span>
                    </div>
                    <div className="font-mono text-xs text-green-400 overflow-x-auto whitespace-pre bg-black/30 p-4 rounded-xl">
                        {JSON.stringify(formValues, null, 2)}
                    </div>
                    <p className="text-[10px] text-white/30 mt-4">
                        * This JSON object will be saved to the `metadata` column in your database.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DynamicForm;

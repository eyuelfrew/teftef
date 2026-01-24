import React, { useState } from 'react';
import { X, Check, MessageSquare, ChevronDown, Cpu, HardDrive, Ruler, Thermometer, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const sampleProduct = {
    title: 'iPhone 15 Pro Max',
    price: 95000,
    category: 'Electronics > Phones',
    images: [
        'https://via.placeholder.com/600x600/0000FF/808080?Text=iPhone+1',
        'https://via.placeholder.com/600x600/0000FF/808080?Text=iPhone+2',
        'https://via.placeholder.com/600x600/0000FF/808080?Text=iPhone+3',
        'https://via.placeholder.com/600x600/0000FF/808080?Text=iPhone+4',
    ],
    metadata: [
        { icon: Cpu, label: 'Processor', value: 'A17 Bionic' },
        { icon: HardDrive, label: 'Storage', value: '256GB' },
        { icon: Ruler, label: 'Display', value: '6.7 inches' },
    ],
    priceAnalysis: {
        status: 'Fair',
        difference: 2,
    }
};

const ApprovalModal = ({ isOpen, onClose, product }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showDeclineReasons, setShowDeclineReasons] = useState(false);

    if (!isOpen) {
        return null;
    }

    const p = product || sampleProduct; // Use passed product or sample

    const formatPrice = (price) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(price);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl flex"
            >
                {/* Left Column: Image Gallery */}
                <div className="w-1/2 p-8 flex flex-col bg-gray-50 rounded-l-3xl">
                    <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-200">
                        <img
                            src={(p.images && p.images.length > 0) ? p.images[selectedImage] : 'https://via.placeholder.com/600'}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        {p.images && p.images.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedImage(i)}
                                className={cn(
                                    "w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                    selectedImage === i ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                                )}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Details & Actions */}
                <div className="w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">{p.category}</p>
                                <h2 className="text-3xl font-bold text-gray-900 mt-1">{p.title}</h2>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="my-8">
                            <p className="text-4xl font-extrabold text-blue-600">{formatPrice(p.price)}</p>
                        </div>
                        
                        {/* Metadata */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {p.metadata && p.metadata.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                        <item.icon className="w-6 h-6 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-gray-500">{item.label}</p>
                                            <p className="font-semibold text-gray-800">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Price Analysis */}
                        <div className="mt-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Price Analysis</h3>
                             <div className="flex items-center gap-3">
                                {p.priceAnalysis.status === 'Fair' && <Thermometer className="w-8 h-8 text-green-500" />}
                                {p.priceAnalysis.status === 'Low' && <TrendingDown className="w-8 h-8 text-blue-500" />}
                                {p.priceAnalysis.status === 'High' && <TrendingUp className="w-8 h-8 text-red-500" />}
                                <div>
                                    <p className={`text-xl font-bold ${p.priceAnalysis.status === 'Fair' ? 'text-green-600' : p.priceAnalysis.status === 'Low' ? 'text-blue-600' : 'text-red-600'}`}>{p.priceAnalysis.status} Price</p>
                                    <p className="text-xs text-gray-500">Compared to category average.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between gap-3">
                        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                            <Check size={20} /> Approve
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowDeclineReasons(!showDeclineReasons)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-all"
                            >
                                Decline <ChevronDown size={16} className={cn('transition-transform', showDeclineReasons && 'rotate-180')} />
                            </button>
                            {showDeclineReasons && (
                                <div
                                    className="absolute bottom-full mb-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2"
                                >
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bad Images</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Pricing Error</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Fake Product</a>
                                </div>
                            )}
                        </div>
                        <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
                            <MessageSquare size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalModal;

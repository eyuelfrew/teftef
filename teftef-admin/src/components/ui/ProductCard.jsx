import React from 'react';
import { User, Calendar, Folder } from 'lucide-react';
import { cn } from '../../utils/cn';

const ProductCard = ({ product, onClick }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-ET', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200/80 cursor-pointer group"
        >
            <div className="relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 text-xs font-bold text-yellow-800 bg-yellow-400 rounded-full">
                        {product.status}
                    </span>
                </div>
                <img
                    src={product.image || 'https://via.placeholder.com/400'}
                    alt={product.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            <div className="p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                    <Folder size={14} />
                    {product.category}
                </p>

                <h3 className="text-lg font-bold text-gray-900 truncate">{product.title}</h3>
                
                <p className="text-2xl font-extrabold text-blue-600 my-3">{formatPrice(product.price)}</p>

                <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center gap-3">
                        <img src={product.user.profile_picture || 'https://i.pravatar.cc/150?img=10'} alt="User" className="w-8 h-8 rounded-full border-2 border-gray-300" />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{product.user.name}</p>
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                                <Calendar size={12} />
                                <span>Joined {product.user.joinDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

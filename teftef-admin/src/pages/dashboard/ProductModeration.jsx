import React, { useState } from 'react';
import StatusSidebar from '../../components/ui/StatusSidebar';
import ProductCard from '../../components/ui/ProductCard';
import ApprovalModal from '../../components/ui/ApprovalModal';
import ModerationHistory from '../../components/ui/ModerationHistory';
import { LayoutGrid } from 'lucide-react';

const sampleProducts = [
    { id: 1, title: 'iPhone 15 Pro Max', price: 95000, status: 'Pending', image: 'https://via.placeholder.com/400/0000FF/808080?Text=iPhone', category: 'Electronics > Phones', user: { name: 'Eyuel T.', joinDate: 'Jan 2024' } },
    { id: 2, title: 'Toyota Yaris 2022', price: 2300000, status: 'Pending', image: 'https://via.placeholder.com/400/FF0000/FFFFFF?Text=Toyota', category: 'Vehicles > Cars', user: { name: 'John D.', joinDate: 'Mar 2023' } },
    { id: 3, title: 'Modern 3-Seater Sofa', price: 25000, status: 'Pending', image: 'https://via.placeholder.com/400/00FF00/000000?Text=Sofa', category: 'Home & Garden > Furniture', user: { name: 'Jane S.', joinDate: 'Feb 2024' } },
    { id: 4, title: 'HP Spectre x360', price: 65000, status: 'Active', image: 'https://via.placeholder.com/400/FFFF00/000000?Text=HP', category: 'Electronics > Laptops', user: { name: 'Peter J.', joinDate: 'May 2023' } },
    { id: 5, title: 'Nike Air Force 1', price: 4500, status: 'Declined', image: 'https://via.placeholder.com/400/00FFFF/000000?Text=Nike', category: 'Fashion > Shoes', user: { name: 'Alice B.', joinDate: 'Jul 2023' } },
];

const ProductModeration = () => {
    const [products, setProducts] = useState(sampleProducts);
    const [status, setStatus] = useState('Pending');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8">
            <div className="flex gap-8">
                <StatusSidebar currentStatus={status} setStatus={setStatus} />
                <main className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <LayoutGrid className="w-8 h-8" />
                            Moderation Feed
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Reviewing <span className="font-bold text-blue-600">{products.filter(p => p.status === 'Pending').length} pending</span> products.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.filter(p => p.status === status).map(product => (
                            <ProductCard key={product.id} product={product} onClick={() => handleCardClick(product)} />
                        ))}
                    </div>
                    <ModerationHistory />
                </main>
            </div>
            <ApprovalModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductModeration;

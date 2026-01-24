import React from 'react';
import { Hourglass, CheckCircle, XCircle, Archive, History } from 'lucide-react';
import { cn } from '../../utils/cn';

const statuses = [
    { name: 'Pending', icon: Hourglass, count: 3 },
    { name: 'Active', icon: CheckCircle, count: 128 },
    { name: 'Declined', icon: XCircle, count: 14 },
    { name: 'Archived', icon: Archive, count: 500 },
];

const StatusSidebar = ({ currentStatus, setStatus }) => {
    return (
        <aside className="w-64 bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col gap-8 sticky top-8 h-[calc(100vh-4rem)]">
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Moderation Status</h2>
                <nav className="space-y-2">
                    {statuses.map((status) => (
                        <button
                            key={status.name}
                            onClick={() => setStatus(status.name)}
                            className={cn(
                                'w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                                currentStatus === status.name
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-800'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <status.icon size={18} />
                                <span>{status.name}</span>
                            </div>
                            <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-bold',
                                currentStatus === status.name ? 'bg-white/20' : 'bg-gray-200'
                            )}>
                                {status.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto">
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <History size={16} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">History</h3>
                </div>
                <div className="space-y-3 text-xs text-gray-500">
                    <p>Admin <span className="font-bold text-gray-800">Eyuel</span> approved 'iPhone 15'.</p>
                    <p className="text-[10px] text-gray-400">2 min ago</p>
                </div>
            </div>
        </aside>
    );
};

export default StatusSidebar;

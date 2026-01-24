import React from 'react';
import { CheckCircle, XCircle, Archive, History } from 'lucide-react';

const sampleHistory = [
    { action: 'Approved', admin: 'Eyuel T.', item: 'iPhone 15 Pro Max', time: '2 min ago', status: 'approved' },
    { action: 'Declined', admin: 'John D.', item: 'Nike Air Force 1', time: '1 hour ago', status: 'declined', reason: 'Bad Images' },
    { action: 'Archived', admin: 'Jane S.', item: 'Old Toyota Vitz', time: '3 hours ago', status: 'archived' },
];

const iconMap = {
    approved: <CheckCircle className="text-green-500" />,
    declined: <XCircle className="text-red-500" />,
    archived: <Archive className="text-slate-500" />,
};

const ModerationHistory = () => {
    return (
        <div className="bg-gray-50 rounded-3xl p-6 mt-8 border border-gray-200">
            <div className="flex items-center gap-3 text-gray-500 mb-6">
                <History size={20} />
                <h2 className="text-xl font-bold text-gray-800">Moderation Log</h2>
            </div>
            <div className="space-y-4">
                {sampleHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="mt-1">{iconMap[entry.status]}</div>
                        <div>
                            <p className="text-sm text-gray-800">
                                <span className="font-bold">{entry.admin}</span> {entry.action.toLowerCase()} '<span className="font-semibold">{entry.item}</span>'
                                {entry.reason && <span className="text-red-600"> (Reason: {entry.reason})</span>}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{entry.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModerationHistory;

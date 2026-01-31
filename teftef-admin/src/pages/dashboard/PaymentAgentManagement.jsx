import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Plus,
    Trash2,
    Edit2,
    Loader2,
    Landmark,
    CreditCard,
} from 'lucide-react';
import PaymentAgentModal from '../../components/ui/PaymentAgentModal';
import { cn } from '../../utils/cn';

const PaymentAgentManagement = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);

    const fetchAgents = async () => {
        try {
            const response = await api.get('/admin/boost-packages/agents/all');
            setAgents(response.data.data.agents);
        } catch (err) {
            console.error("Failed to fetch payment agents", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleSaveAgent = async (formData) => {
        if (editingAgent) {
            await api.patch(`/admin/boost-packages/agents/${editingAgent.id}`, formData);
        } else {
            await api.post('/admin/boost-packages/agents', formData);
        }
        await fetchAgents();
    };

    const handleDeleteAgent = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment agent?')) {
            try {
                await api.delete(`/admin/boost-packages/agents/${id}`);
                await fetchAgents();
            } catch (err) {
                alert('Failed to delete agent');
            }
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#0a0a0a]">Payment Configuration</h1>
                    <p className="text-neutral-500 mt-1">Configure the bank account where users send boost payments.</p>
                </div>
                {agents.length === 0 && (
                    <button
                        onClick={() => {
                            setEditingAgent(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-black/5 group"
                    >
                        <Plus size={18} className="group-hover:scale-110 transition-transform" />
                        Setup Agent
                    </button>
                )}
            </div>

            <div className="flex justify-center">
                {agents.map((agent) => (
                    <div key={agent.id} className="bg-white w-full max-w-2xl rounded-3xl border border-neutral-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
                        <div className="p-8 flex-1">
                            <div className="flex items-start justify-between mb-6">
                                <div className={cn(
                                    "p-4 rounded-3xl bg-neutral-50 border border-neutral-100 group-hover:bg-[#0a0a0a] group-hover:text-white transition-colors duration-500",
                                    !agent.isEnabled && "opacity-50"
                                )}>
                                    <Landmark size={32} />
                                </div>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                                    agent.isEnabled
                                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-700 border-red-500/20"
                                )}>
                                    {agent.isEnabled ? 'Receiving Payments' : 'Payments Paused'}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[11px] uppercase font-bold tracking-[0.2em] text-neutral-400">Main Payment Agent</p>
                                <h3 className="text-2xl font-bold text-[#0a0a0a]">{agent.name}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-6 bg-neutral-50 rounded-3xl border border-neutral-100/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Landmark size={12} /> Bank Name
                                    </p>
                                    <p className="text-base font-semibold text-[#0a0a0a]">{agent.bankName}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                                        <CreditCard size={12} /> Account Number
                                    </p>
                                    <p className="text-base font-bold text-[#0a0a0a] font-mono tracking-tight">{agent.accountNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-50/50 border-t border-neutral-50 flex items-center gap-4">
                            <button
                                onClick={() => {
                                    setEditingAgent(agent);
                                    setIsModalOpen(true);
                                }}
                                className="flex-1 px-6 py-3 bg-[#0a0a0a] text-white rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                            >
                                <Edit2 size={16} /> Update Account Details
                            </button>
                            <button
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="p-3 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                title="Remove Agent"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {agents.length === 0 && (
                    <div className="w-full max-w-2xl py-24 bg-white rounded-3xl border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6 text-neutral-200">
                            <Landmark size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0a0a0a]">No Payment Agent Set</h3>
                        <p className="text-neutral-500 mt-2 max-w-sm mx-auto">Set up your bank account details so users can pay for product boosting.</p>
                        <button
                            onClick={() => {
                                setEditingAgent(null);
                                setIsModalOpen(true);
                            }}
                            className="mt-8 flex items-center gap-2 px-8 py-3 bg-[#0a0a0a] text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
                        >
                            <Plus size={20} /> Initialize Agent
                        </button>
                    </div>
                )}
            </div>

            <PaymentAgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAgent}
                agent={editingAgent}
            />
        </div>
    );
};

export default PaymentAgentManagement;

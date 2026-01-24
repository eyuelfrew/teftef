import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const WarningModal = ({ isOpen, onClose, onProceed }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 m-4">
                <div className="flex justify-between items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100">
                        <X size={20} className="text-neutral-500" />
                    </button>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg leading-6 font-bold text-[#0a0a0a]" id="modal-title">
                        Heads Up: Large Data Request
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-neutral-500">
                            You're about to fetch the complete user list. This could be a large dataset and might take a moment to load.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onProceed}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all"
                    >
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;

import React from 'react';
import DynamicForm from '../../components/ui/DynamicForm';
import { Smartphone } from 'lucide-react';

const FormPreview = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#0a0a0a] flex items-center gap-3">
                    <Smartphone className="w-8 h-8" />
                    App Form Preview
                </h1>
                <p className="text-neutral-500 mt-1">
                    Simulate how your Jiji-style forms will behave in the mobile app.
                </p>
            </div>

            <div className="flex-1">
                <DynamicForm />
            </div>
        </div>
    );
};

export default FormPreview;

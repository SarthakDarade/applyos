
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Listen for custom toast events from utility functions
    useEffect(() => {
        const handleToastEvent = (event) => {
            const { message, type } = event.detail;
            addToast(message, type);
        };

        window.addEventListener('show-toast', handleToastEvent);
        return () => window.removeEventListener('show-toast', handleToastEvent);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md animate-in slide-in-from-right-full duration-300 min-w-[300px]",
                            toast.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-100",
                            toast.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-100",
                            toast.type === 'info' && "bg-neutral-800/90 border-neutral-700 text-neutral-100"
                        )}
                    >
                        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                        {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}

                        <p className="text-sm font-medium flex-1">{toast.message}</p>

                        <button onClick={() => removeToast(toast.id)} className="text-white/50 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};

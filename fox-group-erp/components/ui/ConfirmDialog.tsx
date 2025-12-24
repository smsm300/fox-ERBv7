import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
};

interface ConfirmProviderProps {
    children: React.ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolvePromise?.(true);
        setResolvePromise(null);
        setOptions(null);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolvePromise?.(false);
        setResolvePromise(null);
        setOptions(null);
    };

    const getTypeStyles = () => {
        switch (options?.type) {
            case 'danger':
                return {
                    icon: 'bg-red-500/20 text-red-500',
                    button: 'bg-red-500 hover:bg-red-600',
                };
            case 'warning':
                return {
                    icon: 'bg-amber-500/20 text-amber-500',
                    button: 'bg-amber-500 hover:bg-amber-600',
                };
            default:
                return {
                    icon: 'bg-fox-500/20 text-fox-500',
                    button: 'bg-fox-500 hover:bg-fox-600',
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Confirm Dialog */}
            {isOpen && options && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleCancel}
                    />

                    {/* Dialog */}
                    <div className="relative bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-4 left-4 p-1 rounded-lg hover:bg-dark-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`p-3 rounded-full ${styles.icon}`}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                        </div>

                        {/* Title */}
                        {options.title && (
                            <h3 className="text-xl font-bold text-white text-center mb-2">
                                {options.title}
                            </h3>
                        )}

                        {/* Message */}
                        <p className="text-gray-400 text-center mb-6 leading-relaxed">
                            {options.message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-3 bg-dark-800 text-gray-300 rounded-xl font-bold hover:bg-dark-700 transition-colors"
                            >
                                {options.cancelText || 'إلغاء'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 px-4 py-3 ${styles.button} text-white rounded-xl font-bold transition-colors`}
                            >
                                {options.confirmText || 'تأكيد'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export default ConfirmProvider;

import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Custom Toast Component
export const FoxToaster = () => {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
                top: 20,
            }}
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'Cairo, sans-serif',
                    direction: 'rtl',
                    maxWidth: '400px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#f8fafc',
                    },
                    style: {
                        borderColor: '#10b98133',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#f8fafc',
                    },
                    style: {
                        borderColor: '#ef444433',
                    },
                },
            }}
        />
    );
};

// Toast helper functions with custom styling
export const showToast = {
    success: (message: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-dark-900 border border-emerald-500/30 shadow-lg rounded-xl pointer-events-auto flex items-center gap-3 p-4`}
            >
                <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-white">{message}</p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-dark-800 transition-colors"
                >
                    <X className="h-4 w-4 text-gray-400" />
                </button>
            </div>
        ), { duration: 4000 });
    },

    error: (message: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-dark-900 border border-red-500/30 shadow-lg rounded-xl pointer-events-auto flex items-center gap-3 p-4`}
            >
                <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-white">{message}</p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-dark-800 transition-colors"
                >
                    <X className="h-4 w-4 text-gray-400" />
                </button>
            </div>
        ), { duration: 5000 });
    },

    warning: (message: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-dark-900 border border-amber-500/30 shadow-lg rounded-xl pointer-events-auto flex items-center gap-3 p-4`}
            >
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-white">{message}</p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-dark-800 transition-colors"
                >
                    <X className="h-4 w-4 text-gray-400" />
                </button>
            </div>
        ), { duration: 4000 });
    },

    info: (message: string) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-dark-900 border border-blue-500/30 shadow-lg rounded-xl pointer-events-auto flex items-center gap-3 p-4`}
            >
                <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-white">{message}</p>
                </div>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-dark-800 transition-colors"
                >
                    <X className="h-4 w-4 text-gray-400" />
                </button>
            </div>
        ), { duration: 4000 });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl',
            },
        });
    },

    dismiss: (toastId?: string) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(promise, messages, {
            style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl',
            },
        });
    },
};

export default showToast;

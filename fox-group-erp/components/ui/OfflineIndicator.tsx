import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CloudOff, Cloud, RefreshCw, AlertTriangle } from 'lucide-react';
import { offlineService } from '../../services/offline';

interface OfflineIndicatorProps {
    showWhenOnline?: boolean;
    position?: 'top' | 'bottom';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
    showWhenOnline = false,
    position = 'bottom'
}) => {
    const [isOnline, setIsOnline] = useState(offlineService.getNetworkStatus());
    const [pendingCount, setPendingCount] = useState(offlineService.getPendingCount());
    const [isSyncing, setIsSyncing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const handleNetworkChange = (online: boolean) => {
            setIsOnline(online);
            setPendingCount(offlineService.getPendingCount());
        };

        offlineService.addNetworkListener(handleNetworkChange);

        // Update pending count periodically
        const interval = setInterval(() => {
            setPendingCount(offlineService.getPendingCount());
        }, 5000);

        return () => {
            offlineService.removeNetworkListener(handleNetworkChange);
            clearInterval(interval);
        };
    }, []);

    const handleSync = async () => {
        if (!isOnline || isSyncing) return;

        setIsSyncing(true);
        try {
            const result = await offlineService.syncPendingTransactions();
            setPendingCount(offlineService.getPendingCount());

            if (result.success > 0) {
                // Show success message
                console.log(`Synced ${result.success} transactions`);
            }
            if (result.failed > 0) {
                console.warn(`Failed to sync ${result.failed} transactions`);
            }
        } finally {
            setIsSyncing(false);
        }
    };

    // Don't show anything if online and no pending items (unless showWhenOnline is true)
    if (isOnline && pendingCount === 0 && !showWhenOnline) {
        return null;
    }

    const positionClasses = position === 'top'
        ? 'top-4 left-1/2 -translate-x-1/2'
        : 'bottom-4 left-1/2 -translate-x-1/2';

    return (
        <div className={`fixed ${positionClasses} z-50`}>
            <div
                className={`
          flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm cursor-pointer
          transition-all duration-300 hover:scale-105
          ${isOnline
                        ? pendingCount > 0
                            ? 'bg-amber-500/90 text-dark-950'
                            : 'bg-emerald-500/90 text-dark-950'
                        : 'bg-red-500/90 text-white'
                    }
        `}
                onClick={() => setShowDetails(!showDetails)}
            >
                {/* Status Icon */}
                {isOnline ? (
                    pendingCount > 0 ? (
                        <CloudOff size={20} className="animate-pulse" />
                    ) : (
                        <Wifi size={20} />
                    )
                ) : (
                    <WifiOff size={20} className="animate-pulse" />
                )}

                {/* Status Text */}
                <span className="font-medium text-sm">
                    {isOnline
                        ? pendingCount > 0
                            ? `${pendingCount} معاملات في الانتظار`
                            : 'متصل'
                        : 'غير متصل بالإنترنت'
                    }
                </span>

                {/* Sync Button */}
                {isOnline && pendingCount > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSync();
                        }}
                        disabled={isSyncing}
                        className="p-1.5 bg-dark-950/20 rounded-full hover:bg-dark-950/30 transition-colors"
                    >
                        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>

            {/* Details Panel */}
            {showDetails && (
                <div className="mt-2 bg-dark-900 border border-dark-700 rounded-xl p-4 shadow-2xl w-80">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white">حالة الاتصال</h4>
                        <div className={`flex items-center gap-2 text-sm ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isOnline ? <Cloud size={16} /> : <CloudOff size={16} />}
                            {isOnline ? 'متصل' : 'غير متصل'}
                        </div>
                    </div>

                    {pendingCount > 0 ? (
                        <div className="space-y-3">
                            <div className="bg-dark-800 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-amber-400 mb-2">
                                    <AlertTriangle size={16} />
                                    <span className="font-medium">معاملات في الانتظار</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    سيتم مزامنتها عند استعادة الاتصال
                                </p>
                            </div>

                            {isOnline && (
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="w-full flex items-center justify-center gap-2 bg-fox-500 text-white py-2 rounded-lg font-bold hover:bg-fox-600 transition-colors disabled:opacity-50"
                                >
                                    {isSyncing ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            جاري المزامنة...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={16} />
                                            مزامنة الآن
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-dark-800 p-3 rounded-lg text-center">
                            <p className="text-emerald-400 font-medium">✓ جميع البيانات متزامنة</p>
                            <p className="text-xs text-gray-400 mt-1">
                                آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
                            </p>
                        </div>
                    )}

                    {!isOnline && (
                        <div className="mt-3 text-xs text-gray-400 text-center">
                            يمكنك الاستمرار في العمل. سيتم حفظ البيانات تلقائياً.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OfflineIndicator;

import React from 'react';
import { ActivityLogEntry } from '../../types';

interface ActivityReportProps {
  logs: ActivityLogEntry[];
}

export const ActivityReport: React.FC<ActivityReportProps> = ({ logs }) => {
  return (
    <div className="animate-in fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-dark-900 text-gray-400">
            <tr>
              <th className="p-3">الوقت</th>
              <th className="p-3">المستخدم</th>
              <th className="p-3">الإجراء</th>
              <th className="p-3">التفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800 text-gray-300">
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">لا يوجد نشاط مسجل</td></tr>
            ) : (
              [...logs].reverse().slice(0, 50).map(log => (
                <tr key={log.id} className="hover:bg-dark-900/50">
                  <td className="p-3 font-mono text-gray-500">
                    {new Date(log.date).toLocaleString('ar-EG')}
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-xs">
                        {log.userName.charAt(0)}
                      </span>
                      {log.userName}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

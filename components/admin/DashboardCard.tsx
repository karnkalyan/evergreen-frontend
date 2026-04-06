import React from 'react';

interface DashboardCardProps {
    title: string;
    value: string;
    change?: number;
    icon: React.ReactElement;
    iconBgColor: string;
    loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
    title, 
    value, 
    change, 
    icon, 
    iconBgColor,
    loading = false 
}) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft-md">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    {loading ? (
                        <div className="h-8 bg-slate-200 rounded w-20 mt-2 animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
                    )}
                    {change !== undefined && !loading && (
                        <p className={`text-sm font-medium mt-1 ${
                            change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                        </p>
                    )}
                    {loading && change !== undefined && (
                        <div className="h-4 bg-slate-200 rounded w-16 mt-1 animate-pulse"></div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${iconBgColor} text-white`}>
                    {React.cloneElement(icon, { className: 'w-6 h-6' })}
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', files: 4 },
    { name: 'Tue', files: 12 },
    { name: 'Wed', files: 8 },
    { name: 'Thu', files: 25 },
    { name: 'Fri', files: 18 },
    { name: 'Sat', files: 30 },
    { name: 'Sun', files: 15 },
];

const ActivityChart: React.FC = () => {
    // In real app, process 'history' prop to generate data
    return (
        <div className="bg-light-card dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-6">
                Analysis Activity
            </h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorFiles" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ color: '#8b5cf6' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="files"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorFiles)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityChart;

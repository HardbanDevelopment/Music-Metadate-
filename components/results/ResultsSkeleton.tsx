import React from 'react';

const Shimmer: React.FC = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/50 dark:via-slate-700/50 to-transparent animate-shimmer" style={{ backgroundSize: '2000px 100%' }} />
);

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700/50 rounded-lg ${className}`}>
        <Shimmer />
    </div>
);

const ResultsSkeleton: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <SkeletonBlock className="h-8 w-1/3" />
                <SkeletonBlock className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Card Skeleton */}
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-3">
                            <SkeletonBlock className="w-10 h-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <SkeletonBlock className="h-5 w-1/4" />
                                <SkeletonBlock className="h-4 w-2/4" />
                            </div>
                        </div>
                        <SkeletonBlock className="h-20 w-full" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <SkeletonBlock className="h-12 w-full" />
                            <SkeletonBlock className="h-12 w-full" />
                            <SkeletonBlock className="h-12 w-full" />
                            <SkeletonBlock className="h-12 w-full" />
                        </div>
                    </div>

                    {/* Tags Card Skeleton */}
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-3">
                            <SkeletonBlock className="w-10 h-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <SkeletonBlock className="h-5 w-1/4" />
                                <SkeletonBlock className="h-4 w-2/4" />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[...Array(8)].map((_, i) => <SkeletonBlock key={i} className="h-6 w-20 rounded-full" />)}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Creative Suite Skeleton */}
                    <SkeletonBlock className="h-8 w-1/2 mb-4" />
                    <SkeletonBlock className="h-64 w-full" />
                    <SkeletonBlock className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
};

export default ResultsSkeleton;
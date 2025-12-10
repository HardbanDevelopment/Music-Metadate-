import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Wrench, Server, Activity, BrainCircuit } from './icons';
import Button from './Button';

interface DiagnosticsModalProps {
    onClose: () => void;
}

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ onClose }) => {
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const runTests = async () => {
        setIsLoading(true);
        const report: any = {
            frontend: {
                userAgent: navigator.userAgent,
                time: new Date().toISOString(),
                time: new Date().toISOString(),
            },
            backend: {
                connected: false,
                data: null,
                error: null
            }
        };

        // Frontend Checks


        // Backend Checks
        try {
            const res = await fetch('/health/diagnose');
            if (res.ok) {
                const json = await res.json();
                report.backend.connected = true;
                report.backend.data = json;
            } else {
                report.backend.connected = false;
                report.backend.error = `HTTP ${res.status}: ${res.statusText}`;
            }
        } catch (e) {
            report.backend.connected = false;
            report.backend.error = e instanceof Error ? e.message : String(e);
        }

        setResults(report);
        setIsLoading(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    const StatusIcon = ({ ok }: { ok: boolean }) => (
        ok ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-accent-violet">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Diagnostics</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Component autodiagnosis</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-accent-violet border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Checking system...</p>
                        </div>
                    ) : (
                        <>
                            {/* Frontend Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Client (Frontend)
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">

                                    <div className="text-xs text-slate-400 font-mono pt-2 border-t border-slate-200 dark:border-slate-700">
                                        UA: {results.frontend.userAgent}
                                    </div>
                                </div>
                            </div>

                            {/* Backend Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                                    <Server className="w-4 h-4" /> Server (Backend)
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">REST API Connection</span>
                                        <StatusIcon ok={results.backend.connected} />
                                    </div>

                                    {results.backend.error && (
                                        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900">
                                            {results.backend.error}
                                        </div>
                                    )}

                                    {results.backend.data && (
                                        <>
                                            <div className="mt-4 mb-2 text-xs font-bold text-slate-400 uppercase">Environment Variables (API Keys)</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {Object.entries(results.backend.data.environment_variables).map(([key, val]: [string, any]) => (
                                                    <div key={key} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                                                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate max-w-[150px]" title={key}>{key}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${val === 'Present' || val === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-right text-[10px] text-slate-400">
                                                Backend v{results.backend.data.backend_version} | {results.backend.data.system.os}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                    <Button onClick={runTests} variant="secondary" size="md">
                        Refresh
                    </Button>
                    <Button onClick={onClose} variant="primary" size="md">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticsModal;

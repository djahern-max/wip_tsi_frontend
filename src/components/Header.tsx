// src/components/Header.tsx
import React from 'react';
import { Download, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
    user: { username: string; role: 'admin' | 'viewer' };
    onLogout: () => void;
    onRefresh: () => void;
    onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onRefresh, onExport }) => {
    if (!user?.username || (user.role !== 'admin' && user.role !== 'viewer')) return null;

    const roleLabel = user.role === 'admin' ? 'Admin' : 'Viewer';

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            {/* Left: Title only */}
            <h1 className="truncate text-base font-bold text-gray-800">
                WIP Reporting Tool
            </h1>

            {/* Right: User + Actions */}
            <div className="flex items-center gap-3">
                {/* Username + Role */}
                <div className="flex items-center gap-2" title={`${user.username} (${roleLabel})`}>
                    <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                        {user.username}
                    </span>
                    <span
                        className={[
                            "text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 border",
                            user.role === "admin"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-sky-100 text-sky-800 border-sky-200",
                        ].join(" ")}
                    >
                        {roleLabel}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onRefresh}
                        aria-label="Refresh dashboard"
                        title="Refresh"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition
                       hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    >
                        <RefreshCw size={16} aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={onExport}
                        aria-label="Export to Excel"
                        title="Export to Excel"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition
                       hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    >
                        <Download size={16} aria-hidden="true" />
                    </button>

                    <span
                        aria-hidden="true"
                        className="mx-0.5 h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"
                    />

                    <button
                        type="button"
                        onClick={onLogout}
                        aria-label="Log out"
                        title="Logout"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition
                       hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        <LogOut size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
    );
};

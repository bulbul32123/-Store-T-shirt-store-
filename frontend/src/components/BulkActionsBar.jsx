'use client';
import { useState } from 'react';
import { ChevronDown, Download, X } from 'lucide-react';

const BULK_STATUS_OPTIONS = ['shipped', 'delivered', 'cancelled'];


export default function BulkActionsBar({ selectedIds, orders, onClear, onBulkStatusUpdate, onBulkExport }) {
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);

    if (selectedIds.length === 0) return null;

    return (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-3">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                    {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected
                </span>
                <button onClick={onClear} className="text-blue-600 hover:text-blue-800">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative">
                    <button
                        onClick={() => setStatusMenuOpen((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Update status
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    {statusMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            {BULK_STATUS_OPTIONS.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        onBulkStatusUpdate(status);
                                        setStatusMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm capitalize text-gray-700 hover:bg-gray-100"
                                >
                                    Mark as {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onBulkExport(orders.filter((o) => selectedIds.includes(o.id)))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </button>
            </div>
        </div>
    );
}
// src/components/CommentModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobNumber: string;
    fieldLabel: string;
    fieldValue: string;
    existingComment?: string;
    onSave: (comment: string) => void;
    loading?: boolean;
}

export const CommentModal: React.FC<CommentModalProps> = ({
    isOpen,
    onClose,
    jobNumber,
    fieldLabel,
    fieldValue,
    existingComment,
    onSave,
    loading = false
}) => {
    const [comment, setComment] = useState(existingComment || '');

    useEffect(() => {
        setComment(existingComment || '');
    }, [existingComment]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(comment.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {existingComment ? 'Edit Comment' : 'Add Comment'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <div className="text-sm">
                            <span className="font-medium text-gray-700">Job:</span>
                            <span className="ml-2 text-gray-900">{jobNumber}</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium text-gray-700">Field:</span>
                            <span className="ml-2 text-gray-900">{fieldLabel}</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium text-gray-700">Value:</span>
                            <span className="ml-2 text-gray-900 font-mono">{fieldValue}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Explanation
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Explain why this value changed or provide additional context..."
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !comment.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Comment'}
                    </button>
                </div>
            </div>
        </div>
    );
};
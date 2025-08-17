// Update src/components/CommentModal.tsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UserInitials } from '../components/userInitials';
import { CellExplanation } from '../types/wip';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobNumber: string;
    fieldLabel: string;
    fieldValue: string;
    existingComment?: string;
    existingExplanation?: CellExplanation;  // ADD THIS - full explanation object
    onSave: (comment: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
    isOpen,
    onClose,
    jobNumber,
    fieldLabel,
    fieldValue,
    existingComment,
    existingExplanation,  // ADD THIS
    onSave
}) => {
    const [comment, setComment] = useState(existingComment || '');

    useEffect(() => {
        if (isOpen) {
            setComment(existingComment || '');
        }
    }, [isOpen, existingComment]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (comment.trim()) {
            onSave(comment);
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Comment</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium text-gray-700">Job:</span> {jobNumber}</div>
                        <div><span className="font-medium text-gray-700">Field:</span> {fieldLabel}</div>
                        <div className="col-span-2"><span className="font-medium text-gray-700">Value:</span> {fieldValue}</div>
                    </div>

                    {/* USER INDICATOR - Show who made the existing comment */}
                    {existingExplanation && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <UserInitials
                                firstName={existingExplanation.created_by_first_name}
                                lastName={existingExplanation.created_by_last_name}
                                username={existingExplanation.created_by_name}
                                size="md"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                    {existingExplanation.created_by_first_name && existingExplanation.created_by_last_name
                                        ? `${existingExplanation.created_by_first_name} ${existingExplanation.created_by_last_name}`
                                        : existingExplanation.created_by_name
                                    }
                                </div>
                                <div className="text-gray-500 text-xs">
                                    {new Date(existingExplanation.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={4}
                        placeholder="Enter your explanation... (Ctrl+Enter to save)"
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!comment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Save Comment
                    </button>
                </div>
            </div>
        </div>
    );
};
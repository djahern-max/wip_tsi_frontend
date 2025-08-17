import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, X, Edit3, RefreshCw, AlertCircle } from 'lucide-react';
import { WIPSnapshot, CellExplanation, WIPColumn } from '../types/wip';
import { wipService } from '../services/wipService';
import { wipAPI, WIPWithTotalsResponse } from '../lib/api';
import { CommentModal } from './CommentModal';
import WIPTotalsRow from './WIPTotalsRow';
import { UserInitials } from '../components/userInitials';

// Dynamic column generation function
const getDynamicColumns = (reportDate: string): WIPColumn[] => {
    const currentDate = new Date(reportDate);
    const priorDate = new Date(currentDate);
    priorDate.setMonth(priorDate.getMonth() - 1);

    const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const priorMonthName = priorDate.toLocaleDateString('en-US', { month: 'long' });

    return [
        { key: 'job_number', label: 'Job #', section: 'system', width: '100px', frozen: true },
        { key: 'project_name', label: 'Project Name', section: 'system', width: '300px', frozen: true },
        { key: 'current_month_original_contract_amount', label: 'Original Contract', section: 'contract', width: '140px', type: 'currency' },
        { key: 'current_month_change_order_amount', label: 'Change Orders', section: 'contract', width: '130px', type: 'currency' },
        { key: 'current_month_total_contract_amount', label: `${currentMonthName} Contract`, section: 'contract', width: '140px', type: 'currency' },
        { key: 'prior_month_total_contract_amount', label: `${priorMonthName} Contract`, section: 'contract', width: '130px', type: 'currency' },
        { key: 'current_vs_prior_contract_variance', label: 'Contract Variance', section: 'contract', width: '140px', type: 'currency' },
        { key: 'current_month_cost_to_date', label: 'Cost to Date', section: 'cost', width: '130px', type: 'currency' },
        { key: 'current_month_estimated_cost_to_complete', label: 'Est. Cost to Complete', section: 'cost', width: '160px', type: 'currency' },
        { key: 'current_month_estimated_final_cost', label: `${currentMonthName} Final Cost`, section: 'cost', width: '140px', type: 'currency' },
        { key: 'prior_month_estimated_final_cost', label: `${priorMonthName} Final Cost`, section: 'cost', width: '140px', type: 'currency' },
        { key: 'current_vs_prior_estimated_final_cost_variance', label: 'Final Cost Variance', section: 'cost', width: '150px', type: 'currency' },
        { key: 'us_gaap_percent_completion', label: 'GAAP % Complete', section: 'gaap', width: '130px', type: 'percentage' },
        { key: 'revenue_earned_to_date_us_gaap', label: 'Revenue Earned (GAAP)', section: 'gaap', width: '160px', type: 'currency' },
        { key: 'estimated_job_margin_to_date_us_gaap', label: 'Job Margin (GAAP)', section: 'gaap', width: '150px', type: 'currency' },
        { key: 'estimated_job_margin_to_date_percent_sales', label: 'Job Margin %', section: 'gaap', width: '120px', type: 'percentage' },
        { key: 'current_month_estimated_job_margin_at_completion', label: `${currentMonthName} Job Margin`, section: 'margin', width: '140px', type: 'currency' },
        { key: 'prior_month_estimated_job_margin_at_completion', label: `${priorMonthName} Job Margin`, section: 'margin', width: '140px', type: 'currency' },
        { key: 'current_vs_prior_estimated_job_margin', label: 'Job Margin Variance', section: 'margin', width: '150px', type: 'currency' },
        { key: 'current_month_estimated_job_margin_percent_sales', label: 'Job Margin % Sales', section: 'margin', width: '150px', type: 'percentage' },
        { key: 'current_month_revenue_billed_to_date', label: 'Revenue Billed', section: 'billing', width: '140px', type: 'currency' },
        { key: 'current_month_costs_in_excess_billings', label: 'Costs in Excess', section: 'adjustments', width: '140px', type: 'currency' },
        { key: 'current_month_billings_excess_revenue', label: 'Billings in Excess', section: 'adjustments', width: '150px', type: 'currency' },
        { key: 'current_month_addl_entry_required', label: 'Additional Entry', section: 'adjustments', width: '140px', type: 'currency' }
    ];
};

const SECTION_COLORS: Record<string, string> = {
    system: 'bg-green-100 text-green-800 border-green-300',
    contract: 'bg-blue-100 text-blue-800 border-blue-300',
    cost: 'bg-violet-200 text-violet-900 border-violet-300',
    gaap: 'bg-purple-100 text-purple-800 border-purple-300',
    margin: 'bg-orange-100 text-orange-800 border-orange-300',
    billing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    adjustments: 'bg-red-100 text-red-800 border-red-300'
};

interface EditableTableCellProps {
    value: any;
    type?: string;
    jobNumber: string;
    wipId: number;
    field: keyof WIPSnapshot;
    isAdmin: boolean;
    onSave: (wipId: number, field: keyof WIPSnapshot, value: any) => Promise<void>;
    hasComment?: string;
    commentExplanation?: CellExplanation;  // ADD THIS
    onAddComment: (jobNumber: string, field: keyof WIPSnapshot, value: string) => void;
}

// Replace the EditableTableCell component with this fixed version:

const EditableTableCell: React.FC<EditableTableCellProps> = ({
    value, type, jobNumber, wipId, field, isAdmin, onSave, hasComment, commentExplanation, onAddComment
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const formatCurrency = (amount: number | null | undefined): string => {
        if (amount == null || amount === 0) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPercentage = (percent: number | null | undefined): string => {
        if (percent == null) return '';
        return `${Number(percent).toFixed(2)}%`;
    };

    const formatValue = (val: any, type?: string): string => {
        if (type === 'currency') return formatCurrency(val);
        if (type === 'percentage') return formatPercentage(val);
        return val || '';
    };

    const formattedValue = formatValue(value, type);

    // Check if field is editable
    const isEditable = isAdmin &&
        field !== 'job_number' &&
        field !== 'project_name' &&
        field !== 'current_vs_prior_contract_variance';

    const handleEdit = () => {
        if (!isEditable) return;
        setEditValue(value?.toString() || '');
        setIsEditing(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let parsedValue: any = editValue;

            // Parse based on type
            if (type === 'currency' || type === 'percentage') {
                // Remove currency symbols and commas, parse as number
                const cleanValue = editValue.replace(/[$,%]/g, '');
                parsedValue = cleanValue ? parseFloat(cleanValue) : null;
            }

            await onSave(wipId, field, parsedValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving value:', error);
            alert('Failed to save value');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (field === 'job_number' || field === 'project_name') {
        return (
            <div className="p-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                {value}
            </div>
        );
    }

    return (
        <div className="group relative">
            {isEditing ? (
                <div className="flex items-center p-1 border-r border-gray-200 bg-yellow-50">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full text-right text-sm border border-blue-300 rounded px-1 py-1 focus:outline-none focus:border-blue-500"
                        placeholder={type === 'currency' ? '0.00' : type === 'percentage' ? '0.00' : ''}
                        autoFocus
                    />
                    <div className="flex ml-1 space-x-1">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Save"
                        >
                            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Cancel"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`p-2 text-right font-mono text-sm border-r border-gray-200 min-h-[40px] flex items-center justify-end hover:bg-gray-50 ${isEditable ? 'cursor-pointer' : ''}`}
                    onClick={handleEdit}
                >
                    {formattedValue}
                    {/* FIXED: Show edit icon only for editable fields */}
                    {isEditable && (
                        <Edit3 size={12} className="ml-1 opacity-0 group-hover:opacity-50 text-blue-500" />
                    )}
                </div>
            )}

            {/* User initials indicator in top-left corner if there's a comment */}
            {hasComment && commentExplanation && (
                <div className="absolute -top-1 -left-1 z-20">
                    <UserInitials
                        firstName={commentExplanation.created_by_first_name}
                        lastName={commentExplanation.created_by_last_name}
                        username={commentExplanation.created_by_name}
                        size="xs"
                        className="border-2 border-white shadow-sm"
                    />
                </div>
            )}

            {/* Comment button - positioned in top-right */}
            <button
                onClick={() => onAddComment(jobNumber, field, formattedValue)}
                className={`absolute top-1 right-1 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${hasComment
                    ? 'text-green-600 bg-green-100 hover:bg-green-200'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                    }`}
                title={hasComment ? 'View/Edit Comment' : 'Add Comment'}
            >
                <MessageCircle size={12} />
            </button>

            {/* Tooltip with comment preview */}
            {hasComment && (
                <div className="absolute z-30 bottom-full left-0 mb-1 p-2 bg-green-600 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none max-w-xs">
                    {hasComment}
                </div>
            )}
        </div>
    );
};

interface EditableWIPDashboardProps {
    onReportDateUpdate?: (date: string) => void;
    currentUser: { role: 'admin' | 'viewer' };
}

export const EditableWIPDashboard: React.FC<EditableWIPDashboardProps> = ({ onReportDateUpdate, currentUser }) => {
    const [wipData, setWipData] = useState<WIPSnapshot[]>([]);
    const [wipTotals, setWipTotals] = useState<any>(null);
    const [explanations, setExplanations] = useState<Record<string, CellExplanation[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reportDate, setReportDate] = useState<string>('2025-07-31');

    const isAdmin = currentUser.role === 'admin';

    // Generate dynamic columns based on report date
    const columns = getDynamicColumns(reportDate);

    // Comment modal state - UPDATED to include existingExplanation
    const [commentModal, setCommentModal] = useState<{
        isOpen: boolean;
        jobNumber: string;
        field: keyof WIPSnapshot;
        value: string;
        wipSnapshotId?: number;
        existingComment?: string;
        existingCommentId?: number;
        existingExplanation?: CellExplanation;  // ADD THIS
    }>({
        isOpen: false,
        jobNumber: '',
        field: 'job_number',
        value: ''
    });

    useEffect(() => {
        loadWIPData();
    }, []);

    const loadWIPData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response: WIPWithTotalsResponse = await wipAPI.latestWithTotals();

            setWipData(response.snapshots);
            setWipTotals(response.totals);

            if (response.report_date) {
                setReportDate(response.report_date);
                if (onReportDateUpdate) {
                    onReportDateUpdate(response.report_date);
                }
            }

            // Load explanations without spamming console
            const explanationsMap: Record<string, CellExplanation[]> = {};
            for (const wip of response.snapshots) {
                try {
                    const wipExplanations = await wipService.getExplanations(wip.id);
                    explanationsMap[wip.id.toString()] = wipExplanations;
                } catch (err) {
                    // Silently fail for missing explanations
                }
            }
            setExplanations(explanationsMap);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load WIP data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCell = async (wipId: number, field: keyof WIPSnapshot, value: any) => {
        try {
            const updateData: Partial<WIPSnapshot> = { [field]: value } as Partial<WIPSnapshot>;
            const updatedWip = await wipAPI.update(wipId, updateData);

            // Update the specific record in state with calculated values
            setWipData(prevData =>
                prevData.map(wip =>
                    wip.id === wipId ? { ...wip, ...updatedWip } : wip
                )
            );

            // Reload to get updated totals
            await loadWIPData();
        } catch (error) {
            console.error('Error updating cell:', error);
            throw error;
        }
    };

    // UPDATED to include existingExplanation
    const handleAddComment = (jobNumber: string, field: keyof WIPSnapshot, value: string) => {
        const wip = wipData.find(w => w.job_number === jobNumber);
        if (!wip) return;

        const wipExplanations = explanations[wip.id.toString()] || [];
        const existingExplanation = wipExplanations.find(exp => exp.field_name === field);

        setCommentModal({
            isOpen: true,
            jobNumber,
            field,
            value,
            wipSnapshotId: wip.id,
            existingComment: existingExplanation?.explanation,
            existingCommentId: existingExplanation?.id,
            existingExplanation  // ADD THIS
        });
    };

    const handleSaveComment = async (comment: string) => {
        if (!commentModal.wipSnapshotId) return;

        try {
            if (commentModal.existingCommentId) {
                await wipService.updateExplanation(
                    commentModal.wipSnapshotId,
                    commentModal.existingCommentId,
                    { explanation: comment }
                );
            } else {
                await wipService.createExplanation(commentModal.wipSnapshotId, {
                    field_name: commentModal.field,
                    explanation: comment
                });
            }

            const updatedExplanations = await wipService.getExplanations(commentModal.wipSnapshotId);
            setExplanations(prev => ({
                ...prev,
                [commentModal.wipSnapshotId!.toString()]: updatedExplanations
            }));

        } catch (err) {
            console.error('Error saving comment:', err);
            setError('Failed to save comment');
        }
    };

    // ADD new function to get explanation object
    const getCommentExplanation = (wipId: number, field: keyof WIPSnapshot): CellExplanation | undefined => {
        const wipExplanations = explanations[wipId.toString()] || [];
        return wipExplanations.find(exp => exp.field_name === field);
    };

    const getComment = (wipId: number, field: keyof WIPSnapshot): string | undefined => {
        const wipExplanations = explanations[wipId.toString()] || [];
        return wipExplanations.find(exp => exp.field_name === field)?.explanation;
    };

    // Group columns by section for header
    const groupedColumns = columns.reduce((acc, col) => {
        if (!acc[col.section]) acc[col.section] = [];
        acc[col.section].push(col);
        return acc;
    }, {} as Record<string, WIPColumn[]>);

    const getSectionLabel = (section: string, reportDate?: string): string => {
        const labels: Record<string, string> = {
            system: reportDate ? `Projects - ${new Date(reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : 'Projects',
            contract: 'Contract Section',
            cost: 'Cost Section',
            gaap: 'US GAAP Section',
            margin: 'Job Margin Section',
            billing: 'Billing Section',
            adjustments: 'WIP Adjustments'
        };
        return labels[section] || section;
    };

    const formatCurrency = (amount: number | null | undefined): string => {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-gray-600" size={32} />
                    <p className="text-gray-600">Loading WIP data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={32} />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadWIPData}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <div className="w-full px-4 py-4">
                {/* Admin Notice */}
                {isAdmin && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-blue-800">
                            <Edit3 className="mr-2" size={16} />
                            <span className="font-medium">Admin Mode: Click any cell to edit values directly</span>
                        </div>
                    </div>
                )}

                {/* Summary Header */}
                {wipTotals && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                                <div className="text-gray-600">Total Projects</div>
                                <div className="font-bold text-lg">{wipTotals.total_projects}</div>
                            </div>
                            <div>
                                <div className="text-gray-600">Total Contract Value</div>
                                <div className="font-bold text-lg text-blue-600">
                                    {formatCurrency(wipTotals.total_contract)}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600">Total Job Margin</div>
                                <div className="font-bold text-lg text-green-600">
                                    {formatCurrency(wipTotals.total_job_margin)}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-600">Overall Margin %</div>
                                <div className="font-bold text-lg text-green-600">
                                    {wipTotals.overall_margin_percent?.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
                        <table className="w-full border-separate border-spacing-0">
                            {/* Headers */}
                            <thead className="sticky top-0 z-30">
                                <tr className="h-10">
                                    {Object.entries(groupedColumns).map(([section, cols]) => (
                                        <th
                                            key={section}
                                            colSpan={cols.length}
                                            className={[
                                                "sticky top-0 px-4 text-left text-[13px] font-bold uppercase tracking-wider",
                                                "shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]",
                                                SECTION_COLORS[section],
                                            ].join(" ")}
                                        >
                                            {getSectionLabel(section, section === 'system' ? reportDate : undefined)}
                                        </th>
                                    ))}
                                </tr>

                                <tr className="sticky top-10 z-30 bg-gray-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)] h-12">
                                    {columns.map(col => (
                                        <th
                                            key={col.key}
                                            className={[
                                                "px-2 text-left text-[11px] font-bold text-gray-800 uppercase tracking-wider",
                                                "border-r border-gray-300",
                                                col.frozen ? "sticky left-0 z-40 bg-gray-100" : "bg-gray-100",
                                            ].join(" ")}
                                            style={{
                                                width: col.width,
                                                minWidth: col.width,
                                                ...(col.frozen && { left: col.key === 'job_number' ? 0 : '100px' }),
                                            }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Data Rows */}
                            <tbody>
                                {wipData.map((job, i) => (
                                    <tr
                                        key={job.id}
                                        className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                                    >
                                        {columns.map(col => (
                                            <td
                                                key={`${job.id}-${col.key}`}
                                                className={`${col.frozen
                                                    ? 'sticky z-10 bg-inherit border-r border-gray-300'
                                                    : ''}`}
                                                style={{
                                                    width: col.width,
                                                    minWidth: col.width,
                                                    ...(col.frozen && { left: col.key === 'job_number' ? 0 : '100px' })
                                                }}
                                            >
                                                <EditableTableCell
                                                    value={job[col.key]}
                                                    type={col.type}
                                                    jobNumber={job.job_number}
                                                    wipId={job.id}
                                                    field={col.key}
                                                    isAdmin={isAdmin}
                                                    onSave={handleSaveCell}
                                                    hasComment={getComment(job.id, col.key)}
                                                    commentExplanation={getCommentExplanation(job.id, col.key)}  // ADD THIS
                                                    onAddComment={handleAddComment}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {/* Totals Row */}
                                {wipTotals && <WIPTotalsRow totals={wipTotals} />}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Comment Modal - UPDATED to pass existingExplanation */}
            <CommentModal
                isOpen={commentModal.isOpen}
                onClose={() => setCommentModal(prev => ({ ...prev, isOpen: false }))}
                jobNumber={commentModal.jobNumber}
                fieldLabel={commentModal.field}
                fieldValue={commentModal.value}
                existingComment={commentModal.existingComment}
                existingExplanation={commentModal.existingExplanation}  // ADD THIS
                onSave={handleSaveComment}
            />
        </div>
    );
};
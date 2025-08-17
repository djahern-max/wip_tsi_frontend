// src/components/WIPDashboard.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, Download, RefreshCw, AlertCircle } from 'lucide-react';
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
        // System Fields (frozen)
        { key: 'job_number', label: 'Job #', section: 'system', width: '100px', frozen: true },
        { key: 'project_name', label: 'Project Name', section: 'system', width: '300px', frozen: true },

        // Contract Section (5 columns)
        { key: 'current_month_original_contract_amount', label: 'Original Contract', section: 'contract', width: '140px', type: 'currency' },
        { key: 'current_month_change_order_amount', label: 'Change Orders', section: 'contract', width: '130px', type: 'currency' },
        { key: 'current_month_total_contract_amount', label: `${currentMonthName} Contract`, section: 'contract', width: '140px', type: 'currency' },
        { key: 'prior_month_total_contract_amount', label: `${priorMonthName} Contract`, section: 'contract', width: '130px', type: 'currency' },
        { key: 'current_vs_prior_contract_variance', label: 'Contract Variance', section: 'contract', width: '140px', type: 'currency' },

        // Cost Section (5 columns)
        { key: 'current_month_cost_to_date', label: 'Cost to Date', section: 'cost', width: '130px', type: 'currency' },
        { key: 'current_month_estimated_cost_to_complete', label: 'Est. Cost to Complete', section: 'cost', width: '160px', type: 'currency' },
        { key: 'current_month_estimated_final_cost', label: `${currentMonthName} Final Cost`, section: 'cost', width: '140px', type: 'currency' },
        { key: 'prior_month_estimated_final_cost', label: `${priorMonthName} Final Cost`, section: 'cost', width: '140px', type: 'currency' },
        { key: 'current_vs_prior_estimated_final_cost_variance', label: 'Final Cost Variance', section: 'cost', width: '150px', type: 'currency' },

        // US GAAP Section (4 columns)
        { key: 'us_gaap_percent_completion', label: 'GAAP % Complete', section: 'gaap', width: '130px', type: 'percentage' },
        { key: 'revenue_earned_to_date_us_gaap', label: 'Revenue Earned (GAAP)', section: 'gaap', width: '160px', type: 'currency' },
        { key: 'estimated_job_margin_to_date_us_gaap', label: 'Job Margin (GAAP)', section: 'gaap', width: '150px', type: 'currency' },
        { key: 'estimated_job_margin_to_date_percent_sales', label: 'Job Margin %', section: 'gaap', width: '120px', type: 'percentage' },

        // Job Margin Section (4 columns)
        { key: 'current_month_estimated_job_margin_at_completion', label: `${currentMonthName} Job Margin`, section: 'margin', width: '140px', type: 'currency' },
        { key: 'prior_month_estimated_job_margin_at_completion', label: `${priorMonthName} Job Margin`, section: 'margin', width: '140px', type: 'currency' },
        { key: 'current_vs_prior_estimated_job_margin', label: 'Job Margin Variance', section: 'margin', width: '150px', type: 'currency' },
        { key: 'current_month_estimated_job_margin_percent_sales', label: 'Job Margin % Sales', section: 'margin', width: '150px', type: 'percentage' },

        // Billing Section (1 column)
        { key: 'current_month_revenue_billed_to_date', label: 'Revenue Billed', section: 'billing', width: '140px', type: 'currency' },

        // WIP Adjustments (3 columns)
        { key: 'current_month_costs_in_excess_billings', label: 'Costs in Excess', section: 'adjustments', width: '140px', type: 'currency' },
        { key: 'current_month_billings_excess_revenue', label: 'Billings in Excess', section: 'adjustments', width: '150px', type: 'currency' },
        { key: 'current_month_addl_entry_required', label: 'Additional Entry', section: 'adjustments', width: '140px', type: 'currency' }
    ];
};

// Professional section colors for collapsible headers
const SECTION_COLORS: Record<string, string> = {
    system: 'bg-green-100 text-green-800 border-green-300',
    contract: 'bg-blue-100 text-blue-800 border-blue-300',
    cost: 'bg-violet-200 text-violet-900 border-violet-300',
    gaap: 'bg-purple-100 text-purple-800 border-purple-300',
    margin: 'bg-orange-100 text-orange-800 border-orange-300',
    billing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    adjustments: 'bg-red-100 text-red-800 border-red-300'
};

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

// Formatting functions
const formatCurrency = (value: number | null | undefined): string => {
    if (value == null || value === 0) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const formatPercentage = (value: number | null | undefined): string => {
    if (value == null) return '';
    return `${Number(value).toFixed(2)}%`;
};

const formatValue = (value: any, type?: string): string => {
    if (type === 'currency') return formatCurrency(value);
    if (type === 'percentage') return formatPercentage(value);
    return value || '';
};

// Field label mapping
const FIELD_LABELS: Record<string, string> = {
    current_month_original_contract_amount: 'Original Contract Amount',
    current_month_change_order_amount: 'Change Order Amount',
    current_month_total_contract_amount: 'Total Contract Amount',
    prior_month_total_contract_amount: 'Prior Month Contract',
    current_vs_prior_contract_variance: 'Contract Variance',
    current_month_cost_to_date: 'Cost to Date',
    current_month_estimated_cost_to_complete: 'Estimated Cost to Complete',
    current_month_estimated_final_cost: 'Estimated Final Cost',
    prior_month_estimated_final_cost: 'Prior Month Final Cost',
    current_vs_prior_estimated_final_cost_variance: 'Final Cost Variance',
    us_gaap_percent_completion: 'US GAAP % Complete',
    revenue_earned_to_date_us_gaap: 'Revenue Earned (GAAP)',
    estimated_job_margin_to_date_us_gaap: 'Job Margin (GAAP)',
    estimated_job_margin_to_date_percent_sales: 'Job Margin %',
    current_month_estimated_job_margin_at_completion: 'Estimated Job Margin',
    prior_month_estimated_job_margin_at_completion: 'Prior Job Margin',
    current_vs_prior_estimated_job_margin: 'Job Margin Variance',
    current_month_estimated_job_margin_percent_sales: 'Job Margin % of Sales',
    current_month_revenue_billed_to_date: 'Revenue Billed to Date',
    current_month_costs_in_excess_billings: 'Costs in Excess of Billings',
    current_month_billings_excess_revenue: 'Billings in Excess of Revenue',
    current_month_addl_entry_required: 'Additional Entry Required'
};

interface TableCellProps {
    value: any;
    type?: string;
    jobNumber: string;
    field: keyof WIPSnapshot;
    hasComment?: string;
    commentExplanation?: CellExplanation;  // UPDATED - full explanation object
    onAddComment: (jobNumber: string, field: keyof WIPSnapshot, value: string) => void;
}

const TableCell: React.FC<TableCellProps> = ({
    value,
    type,
    jobNumber,
    field,
    hasComment,
    commentExplanation,  // UPDATED
    onAddComment
}) => {
    const formattedValue = formatValue(value, type);

    return (
        <div className="group relative">
            <div className="p-2 text-right font-mono text-sm border-r border-gray-200 min-h-[40px] flex items-center justify-end hover:bg-gray-50">
                {formattedValue}
            </div>

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

            {/* Comment button */}
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

interface WIPDashboardProps {
    onReportDateUpdate?: (date: string) => void;
}

export const WIPDashboard: React.FC<WIPDashboardProps> = ({ onReportDateUpdate }) => {
    // Updated state to include totals
    const [wipData, setWipData] = useState<WIPSnapshot[]>([]);
    const [wipTotals, setWipTotals] = useState<any>(null);
    const [explanations, setExplanations] = useState<Record<string, CellExplanation[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reportDate, setReportDate] = useState<string>('2025-07-31');

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

    // Load data on mount
    useEffect(() => {
        loadWIPData();
    }, []);

    const loadWIPData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use the new API endpoint that includes totals
            const response: WIPWithTotalsResponse = await wipAPI.latestWithTotals();

            setWipData(response.snapshots);
            setWipTotals(response.totals);

            // Set report date from response
            if (response.report_date) {
                setReportDate(response.report_date);
                // Notify parent component of report date
                if (onReportDateUpdate) {
                    onReportDateUpdate(response.report_date);
                }
            }

            // Load explanations for each WIP snapshot
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
            console.error('Error loading WIP data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            await wipService.downloadExcel();
        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed: " + (err instanceof Error ? err.message : "Unknown error"));
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
                // Update existing comment
                await wipService.updateExplanation(
                    commentModal.wipSnapshotId,
                    commentModal.existingCommentId,
                    { explanation: comment }
                );
            } else {
                // Create new comment
                await wipService.createExplanation(commentModal.wipSnapshotId, {
                    field_name: commentModal.field,
                    explanation: comment
                });
            }

            // Reload explanations
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

    const formatReportDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

                {/* Table Container with Sticky Headers */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
                        <table className="w-full border-separate border-spacing-0">
                            {/* Section Headers - Sticky row #1 */}
                            <thead className="sticky top-0 z-30">
                                <tr className="h-10">{Object.entries(groupedColumns).map(([section, cols]) => (
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
                                ))}</tr>

                                <tr className="sticky top-10 z-30 bg-gray-100 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)] h-12">{columns.map(col => (
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
                                ))}</tr>
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
                                                {col.key === 'job_number' || col.key === 'project_name' ? (
                                                    <div className="p-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                                                        {job[col.key]}
                                                    </div>
                                                ) : (
                                                    <TableCell
                                                        value={job[col.key]}
                                                        type={col.type}
                                                        jobNumber={job.job_number}
                                                        field={col.key}
                                                        hasComment={getComment(job.id, col.key)}
                                                        commentExplanation={getCommentExplanation(job.id, col.key)}  // ADD THIS
                                                        onAddComment={handleAddComment}
                                                    />
                                                )}
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
                fieldLabel={FIELD_LABELS[commentModal.field] || commentModal.field}
                fieldValue={commentModal.value}
                existingComment={commentModal.existingComment}
                existingExplanation={commentModal.existingExplanation}  // ADD THIS
                onSave={handleSaveComment}
            />
        </div>
    );
};
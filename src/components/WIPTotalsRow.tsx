import React from 'react';

interface WIPTotals {
    total_original_contract: number;
    total_change_orders: number;
    total_contract: number;
    total_prior_contract: number;
    contract_variance: number;
    total_cost_to_date: number;
    total_est_cost_complete: number;
    total_estimated_final_cost: number;
    total_prior_final_cost: number;
    final_cost_variance: number;
    avg_percent_completion: number;
    avg_us_gaap_completion: number;
    total_billed_to_date: number;
    total_revenue_earned: number;
    total_job_margin: number;
    total_prior_job_margin: number;
    job_margin_variance: number;
    avg_job_margin_percent: number;
    total_costs_excess_billings: number;
    total_billings_excess_revenue: number;
    total_projects: number;
    overall_margin_percent: number;
}

interface WIPTotalsRowProps {
    totals: WIPTotals;
}

const WIPTotalsRow: React.FC<WIPTotalsRowProps> = ({ totals }) => {
    const formatCurrency = (amount: number | null | undefined): string => {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercent = (percent: number | null | undefined): string => {
        if (percent === null || percent === undefined) return '-';
        return `${percent.toFixed(1)}%`;
    };

    const getVarianceClass = (variance: number): string => {
        if (variance > 0) return 'text-green-600 font-medium';
        if (variance < 0) return 'text-red-600 font-medium';
        return 'text-gray-600';
    };

    return (
        <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold text-sm">
            {/* Job # column */}
            <td className="px-3 py-3 text-left">
                <div className="font-bold text-gray-800">
                    TOTALS ({totals.total_projects} projects)
                </div>
            </td>

            {/* Project Name column */}
            <td className="px-3 py-3 text-left">
                <div className="text-gray-600 text-xs">
                    Overall Margin: {formatPercent(totals.overall_margin_percent)}
                </div>
            </td>

            {/* CONTRACT SECTION */}
            {/* Original Contract */}
            <td className="px-3 py-3 text-right border-l border-gray-300">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_original_contract)}
                </div>
            </td>

            {/* Change Orders */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_change_orders)}
                </div>
            </td>

            {/* Total Contract */}
            <td className="px-3 py-3 text-right">
                <div className="text-blue-800 font-bold">
                    {formatCurrency(totals.total_contract)}
                </div>
            </td>

            {/* Prior Contract */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-600">
                    {formatCurrency(totals.total_prior_contract)}
                </div>
            </td>

            {/* Contract Variance */}
            <td className="px-3 py-3 text-right">
                <div className={getVarianceClass(totals.contract_variance)}>
                    {formatCurrency(totals.contract_variance)}
                </div>
            </td>

            {/* COST SECTION */}
            {/* Cost to Date */}
            <td className="px-3 py-3 text-right border-l border-gray-300">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_cost_to_date)}
                </div>
            </td>

            {/* Est. Cost to Complete */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_est_cost_complete)}
                </div>
            </td>

            {/* Est. Final Cost */}
            <td className="px-3 py-3 text-right">
                <div className="text-blue-800 font-bold">
                    {formatCurrency(totals.total_estimated_final_cost)}
                </div>
            </td>

            {/* Prior Final Cost */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-600">
                    {formatCurrency(totals.total_prior_final_cost)}
                </div>
            </td>

            {/* Final Cost Variance */}
            <td className="px-3 py-3 text-right">
                <div className={getVarianceClass(totals.final_cost_variance)}>
                    {formatCurrency(totals.final_cost_variance)}
                </div>
            </td>

            {/* US GAAP % Completion */}
            <td className="px-3 py-3 text-right border-l border-gray-300">
                <div className="text-blue-800 font-bold">
                    {formatPercent(totals.avg_us_gaap_completion)}
                </div>
                <div className="text-xs text-gray-500">weighted avg</div>
            </td>

            {/* Revenue Earned */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_revenue_earned)}
                </div>
            </td>

            {/* Job Margin $ */}
            <td className="px-3 py-3 text-right">
                <div className="text-blue-800 font-bold">
                    {formatCurrency(totals.total_job_margin)}
                </div>
            </td>

            {/* Prior Job Margin */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-600">
                    {formatCurrency(totals.total_prior_job_margin)}
                </div>
            </td>

            {/* Job Margin Variance */}
            <td className="px-3 py-3 text-right">
                <div className={getVarianceClass(totals.job_margin_variance)}>
                    {formatCurrency(totals.job_margin_variance)}
                </div>
            </td>

            {/* Job Margin % */}
            <td className="px-3 py-3 text-right">
                <div className="text-blue-800 font-bold">
                    {formatPercent(totals.avg_job_margin_percent)}
                </div>
                <div className="text-xs text-gray-500">weighted avg</div>
            </td>

            {/* Billed to Date */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_billed_to_date)}
                </div>
            </td>

            {/* WIP Adjustments */}
            <td className="px-3 py-3 text-right">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_costs_excess_billings)}
                </div>
            </td>

            <td className="px-3 py-3 text-right">
                <div className="text-gray-800">
                    {formatCurrency(totals.total_billings_excess_revenue)}
                </div>
            </td>
        </tr>
    );
};

export default WIPTotalsRow;
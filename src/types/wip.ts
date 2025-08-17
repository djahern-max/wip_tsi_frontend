// src/types/wip.ts
export interface WIPSnapshot {
    // System Fields
    id: number;
    project_id: number;
    job_number: string;
    project_name?: string;
    report_date: string;

    // Contract Section
    current_month_original_contract_amount?: number;
    current_month_change_order_amount?: number;
    current_month_total_contract_amount?: number;
    prior_month_total_contract_amount?: number;
    current_vs_prior_contract_variance?: number;

    // Cost Section
    current_month_cost_to_date?: number;
    current_month_estimated_cost_to_complete?: number;
    current_month_estimated_final_cost?: number;
    prior_month_estimated_final_cost?: number;
    current_vs_prior_estimated_final_cost_variance?: number;

    // US GAAP Section
    us_gaap_percent_completion?: number;
    revenue_earned_to_date_us_gaap?: number;
    estimated_job_margin_to_date_us_gaap?: number;
    estimated_job_margin_to_date_percent_sales?: number;

    // Job Margin Section
    current_month_estimated_job_margin_at_completion?: number;
    prior_month_estimated_job_margin_at_completion?: number;
    current_vs_prior_estimated_job_margin?: number;
    current_month_estimated_job_margin_percent_sales?: number;

    // Billing Section
    current_month_revenue_billed_to_date?: number;

    // WIP Adjustments Section
    current_month_costs_in_excess_billings?: number;
    current_month_billings_excess_revenue?: number;
    current_month_addl_entry_required?: number;
}

export interface CellExplanation {
    id: number;
    wip_snapshot_id: number;
    field_name: string;
    explanation: string;
    created_by: number;
    created_by_name: string;
    created_by_first_name?: string;  // ADD THIS
    created_by_last_name?: string;   // ADD THIS
    created_at: string;
    updated_at: string;
}

// Add this helper interface for user info
export interface UserInfo {
    firstName?: string;
    lastName?: string;
    username?: string;
}

export interface ExplanationCreate {
    field_name: string;
    explanation: string;
}

export interface ExplanationUpdate {
    explanation: string;
}

export interface WIPColumn {
    key: keyof WIPSnapshot;
    label: string;
    section: string;
    width: string;
    type?: 'currency' | 'percentage' | 'text';
    frozen?: boolean;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface AuthToken {
    access_token: string;
    token_type: string;
    user_id: number;
    username: string;
    role: string;
}


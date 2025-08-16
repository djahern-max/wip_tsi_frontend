import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'viewer';
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user_id: number;
    username: string;
    role: 'admin' | 'viewer';
}

export interface Project {
    id: number;
    job_number: string;
    name: string;
    original_contract_amount?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    total_wip_snapshots?: number;
    latest_report_date?: string;
}

export interface WIPSnapshot {
    id: number;
    project_id: number;
    job_number: string;
    project_name?: string;
    report_date: string;

    // Input fields
    current_month_original_contract_amount?: number;
    current_month_change_order_amount?: number;
    current_month_cost_to_date?: number;
    current_month_estimated_cost_to_complete?: number;
    current_month_revenue_billed_to_date?: number;
    current_month_addl_entry_required?: number;

    // Calculated contract fields
    current_month_total_contract_amount?: number;
    prior_month_total_contract_amount?: number;
    current_vs_prior_contract_variance?: number;

    // Calculated cost fields
    current_month_estimated_final_cost?: number;
    prior_month_estimated_final_cost?: number;
    current_vs_prior_estimated_final_cost_variance?: number;

    // Calculated US GAAP fields
    us_gaap_percent_completion?: number;
    revenue_earned_to_date_us_gaap?: number;
    estimated_job_margin_to_date_us_gaap?: number;
    estimated_job_margin_to_date_percent_sales?: number;

    // Calculated job margin fields
    current_month_estimated_job_margin_at_completion?: number;
    prior_month_estimated_job_margin_at_completion?: number;
    current_vs_prior_estimated_job_margin?: number;
    current_month_estimated_job_margin_percent_sales?: number;

    // Calculated WIP adjustments
    current_month_costs_in_excess_billings?: number;
    current_month_billings_excess_revenue?: number;
}

export interface WIPDashboardSummary {
    total_projects: number;
    total_contract_value: number;
    total_cost_to_date: number;
    total_billed_to_date: number;
    total_estimated_final_cost: number;
    overall_margin: number;
    overall_margin_percent: number;
    report_date: string;
}

// Auth token management - FIXED to use access_token
let authToken: string | null = localStorage.getItem('access_token');

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        localStorage.setItem('access_token', token);  // ✅ 
        // ...
    } else {
        localStorage.removeItem('access_token');  // ✅
        // ...
    }
};

// Initialize auth token on app load
if (authToken) {
    apiClient.defaults.headers.Authorization = `Bearer ${authToken}`;
}

// API Functions
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post('/auth/login', credentials);
        const loginData = response.data;
        setAuthToken(loginData.access_token);
        return loginData;
    },

    logout: () => {
        setAuthToken(null);
    },

    verifyToken: async (): Promise<{ valid: boolean; user: User }> => {
        const response = await apiClient.post('/auth/verify-token');
        return response.data;
    },
};

export const projectsAPI = {
    list: async (): Promise<Project[]> => {
        const response = await apiClient.get('/projects/');
        return response.data;
    },

    get: async (id: number): Promise<Project> => {
        const response = await apiClient.get(`/projects/${id}`);
        return response.data;
    },
};

export const wipAPI = {
    list: async (): Promise<WIPSnapshot[]> => {
        const response = await apiClient.get('/wip/');
        return response.data;
    },

    latest: async (): Promise<WIPSnapshot[]> => {
        const response = await apiClient.get('/wip/latest');
        return response.data;
    },

    get: async (id: number): Promise<WIPSnapshot> => {
        const response = await apiClient.get(`/wip/${id}`);
        return response.data;
    },

    dashboardSummary: async (): Promise<WIPDashboardSummary> => {
        const response = await apiClient.get('/wip/summary/dashboard');
        return response.data;
    },
};

export const usersAPI = {
    me: async (): Promise<User> => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },
};

// Utility functions
export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatPercent = (percent: number | null | undefined): string => {
    if (percent === null || percent === undefined) return 'N/A';
    return `${percent.toFixed(1)}%`;
};

export const getChangeIndicator = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous || current === previous) return null;

    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(change),
        isIncrease: change > 0,
        isDecrease: change < 0,
    };
};
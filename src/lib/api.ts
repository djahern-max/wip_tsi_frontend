import axios from 'axios';
import { getValidToken, clearAuthData } from './TokenManager';

const API_BASE = 'http://localhost:8000';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth token management
export const setAuthToken = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.Authorization;
    }
};

// Initialize auth token on app load
const validToken = getValidToken();
if (validToken) {
    setAuthToken(validToken);
}

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            clearAuthData();
            delete apiClient.defaults.headers.Authorization;
            // Redirect to login by reloading the app
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// Types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user_id: number;
    username: string;
    role: string;
}

export interface User {
    id: number;
    username: string;
    role: string;
    is_active: boolean;
}

export interface Project {
    id: number;
    job_number: string;
    name: string;
    original_contract_amount: number;
    is_active: boolean;
    total_wip_snapshots?: number;
    latest_report_date?: string;
}

export interface WIPSnapshot {
    id: number;
    project_id: number;
    project_name: string;
    report_date: string;
    job_number: string;

    // Contract fields
    current_month_original_contract_amount?: number;
    current_month_change_order_amount?: number;
    current_month_total_contract_amount?: number;
    prior_month_total_contract_amount?: number;
    current_vs_prior_contract_variance?: number;

    // Cost fields
    current_month_cost_to_date?: number;
    current_month_estimated_cost_to_complete?: number;
    current_month_estimated_final_cost?: number;
    prior_month_estimated_final_cost?: number;
    current_vs_prior_estimated_final_cost_variance?: number;

    // US GAAP fields
    us_gaap_percent_completion?: number;
    revenue_earned_to_date_us_gaap?: number;
    estimated_job_margin_to_date_us_gaap?: number;
    estimated_job_margin_to_date_percent_sales?: number;

    // Calculated job margin fields
    current_month_estimated_job_margin_at_completion?: number;
    prior_month_estimated_job_margin_at_completion?: number;
    current_vs_prior_estimated_job_margin?: number;
    current_month_estimated_job_margin_percent_sales?: number;

    // Billing fields
    current_month_revenue_billed_to_date?: number;

    // WIP adjustments
    current_month_costs_in_excess_billings?: number;
    current_month_billings_excess_revenue?: number;
    current_month_addl_entry_required?: number;
}

export interface WIPTotals {
    // Contract section
    total_original_contract: number;
    total_change_orders: number;
    total_contract: number;
    total_prior_contract: number;
    contract_variance: number;

    // Cost section
    total_cost_to_date: number;
    total_est_cost_complete: number;
    total_estimated_final_cost: number;
    total_prior_final_cost: number;
    final_cost_variance: number;

    // Percentages (weighted averages)
    avg_us_gaap_completion: number;

    // Revenue section
    total_billed_to_date: number;
    total_revenue_earned: number;

    // Job margin section
    total_job_margin: number;
    total_prior_job_margin: number;
    job_margin_variance: number;
    avg_job_margin_percent: number;

    // WIP adjustments
    total_costs_excess_billings: number;
    total_billings_excess_revenue: number;

    // Summary stats
    total_projects: number;
    overall_margin_percent: number;
}

export interface WIPWithTotalsResponse {
    snapshots: WIPSnapshot[];
    totals: WIPTotals;
    report_date: string | null;
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
        clearAuthData();
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

    latestWithTotals: async (): Promise<WIPWithTotalsResponse> => {
        const response = await apiClient.get('/wip/latest/with-totals');
        return response.data;
    },

    update: async (wipId: number, updateData: Partial<WIPSnapshot>): Promise<WIPSnapshot> => {
        const response = await apiClient.put(`/wip/${wipId}`, updateData);
        return response.data;
    },

    create: async (wipData: Partial<WIPSnapshot>): Promise<WIPSnapshot> => {
        const response = await apiClient.post('/wip/', wipData);
        return response.data;
    },

    delete: async (wipId: number): Promise<void> => {
        await apiClient.delete(`/wip/${wipId}`);
    }
};
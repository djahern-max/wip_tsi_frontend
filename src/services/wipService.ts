// src/services/wipService.ts
import { WIPSnapshot, CellExplanation, ExplanationCreate, ExplanationUpdate, ApiResponse } from '../types/wip';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

class WIPService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // WIP Snapshot endpoints
    async getLatestWIPSnapshots(): Promise<WIPSnapshot[]> {
        const response = await fetch(`${API_BASE}/wip/latest`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch WIP data: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    async getWIPSnapshot(id: number): Promise<WIPSnapshot> {
        const response = await fetch(`${API_BASE}/wip/snapshots/${id}`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch WIP snapshot: ${response.statusText}`);
        }

        return response.json();
    }

    async updateWIPSnapshot(id: number, data: Partial<WIPSnapshot>): Promise<WIPSnapshot> {
        const response = await fetch(`${API_BASE}/wip/snapshots/${id}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to update WIP snapshot: ${response.statusText}`);
        }

        return response.json();
    }

    // Explanation endpoints
    async getExplanations(wipSnapshotId: number): Promise<CellExplanation[]> {
        const response = await fetch(`${API_BASE}/explanations/wip/${wipSnapshotId}`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch explanations: ${response.statusText}`);
        }

        return response.json();
    }


    async createExplanation(wipSnapshotId: number, explanation: ExplanationCreate): Promise<CellExplanation> {
        const response = await fetch(`${API_BASE}/explanations/wip/${wipSnapshotId}`, {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(explanation)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create explanation: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    async updateExplanation(wipSnapshotId: number, explanationId: number, explanation: ExplanationUpdate): Promise<CellExplanation> {
        const response = await fetch(`${API_BASE}/explanations/${explanationId}`, {
            method: 'PUT',
            headers: {
                ...this.getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(explanation)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update explanation: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    async deleteExplanation(explanationId: number): Promise<void> {
        const response = await fetch(`${API_BASE}/explanations/${explanationId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete explanation: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }

    // Dashboard summary
    async getDashboardSummary(): Promise<any> {
        const response = await fetch(`${API_BASE}/wip/summary/dashboard`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch dashboard summary: ${response.statusText}`);
        }

        return response.json();
    }

    // Export functionality
    async downloadExcel(): Promise<void> {
        const response = await fetch(`${API_BASE}/wip/export/excel`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to export data: ${response.statusText}`);
        }

        // Get filename from response headers or create default
        const contentDisposition = response.headers.get("content-disposition");
        let filename = "TSI_WIP_Report.xlsx";
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }

        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

export const wipService = new WIPService();


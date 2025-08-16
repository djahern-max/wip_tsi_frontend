// src/services/wipService.ts
import { WIPSnapshot, CellExplanation, ExplanationCreate, ExplanationUpdate, ApiResponse } from '../types/wip';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
        const response = await fetch(`${API_BASE}/wip/snapshots/${wipSnapshotId}/explanations`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch explanations: ${response.statusText}`);
        }

        return response.json();
    }

    async createExplanation(wipSnapshotId: number, explanation: ExplanationCreate): Promise<CellExplanation> {
        const response = await fetch(`${API_BASE}/wip/snapshots/${wipSnapshotId}/explanations`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(explanation)
        });

        if (!response.ok) {
            throw new Error(`Failed to create explanation: ${response.statusText}`);
        }

        return response.json();
    }

    async updateExplanation(wipSnapshotId: number, explanationId: number, explanation: ExplanationUpdate): Promise<CellExplanation> {
        const response = await fetch(`${API_BASE}/wip/snapshots/${wipSnapshotId}/explanations/${explanationId}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(explanation)
        });

        if (!response.ok) {
            throw new Error(`Failed to update explanation: ${response.statusText}`);
        }

        return response.json();
    }

    async deleteExplanation(wipSnapshotId: number, explanationId: number): Promise<void> {
        const response = await fetch(`${API_BASE}/wip/snapshots/${wipSnapshotId}/explanations/${explanationId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete explanation: ${response.statusText}`);
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
}

export const wipService = new WIPService();
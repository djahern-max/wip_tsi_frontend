// src/lib/tokenManager.ts
export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        return true; // If we can't parse it, consider it expired
    }
};

export const getValidToken = (): string | null => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    if (isTokenExpired(token)) {
        // Token is expired, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return null;
    }

    return token;
};

export const clearAuthData = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
};

export const setAuthData = (token: string, userData: any): void => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
};

export const getStoredUser = (): any | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        return null;
    }
};
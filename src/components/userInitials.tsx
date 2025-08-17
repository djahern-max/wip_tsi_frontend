// Create src/components/UserInitials.tsx

import React from 'react';

interface UserInitialsProps {
    firstName?: string;
    lastName?: string;
    username?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
}

export const getUserInitials = (firstName?: string, lastName?: string, username?: string): string => {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (firstName) {
        return firstName[0].toUpperCase();
    }

    // Fallback: use first two letters of username before @
    if (username) {
        const beforeAt = username.split('@')[0];
        return beforeAt.substring(0, 2).toUpperCase();
    }

    return 'UN'; // Unknown
};

export const UserInitials: React.FC<UserInitialsProps> = ({
    firstName,
    lastName,
    username,
    size = 'sm',
    className = ''
}) => {
    const initials = getUserInitials(firstName, lastName, username);

    const sizeClasses = {
        xs: 'w-4 h-4 text-xs',
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base'
    };

    return (
        <div className={`${sizeClasses[size]} bg-blue-100 rounded-full flex items-center justify-center font-medium text-blue-800 ${className}`}>
            {initials}
        </div>
    );
};
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileModal } from './UserProfileModal';

interface ClickableUserNameProps {
  userId: string;
  name?: string | null;
  email: string;
  className?: string;
  showEmail?: boolean;
  children?: React.ReactNode;
}

export function ClickableUserName({ 
  userId, 
  name, 
  email, 
  className = '',
  showEmail = false,
  children 
}: ClickableUserNameProps) {
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const displayName = name || email.split('@')[0];
  const isOwnProfile = currentUser?.id === userId;

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a nested link
    if ((e.target as HTMLElement).closest('a')) {
      e.stopPropagation();
      return;
    }

    // If it's the current user's own profile, navigate to full profile page
    // Otherwise, open modal
    if (isOwnProfile) {
      return; // Let the Link handle navigation
    }

    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      {isOwnProfile ? (
        <Link
          href={`/profile/${userId}`}
          className={`hover:text-node-volt transition-colors ${className}`}
          onClick={handleClick}
        >
          {children || (
            <>
              <span className="font-medium">{displayName}</span>
              {showEmail && name && (
                <span className="text-muted-text text-sm ml-1">({email})</span>
              )}
            </>
          )}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`hover:text-node-volt transition-colors cursor-pointer text-left ${className}`}
        >
          {children || (
            <>
              <span className="font-medium">{displayName}</span>
              {showEmail && name && (
                <span className="text-muted-text text-sm ml-1">({email})</span>
              )}
            </>
          )}
        </button>
      )}
      {!isOwnProfile && (
        <UserProfileModal
          userId={userId}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}


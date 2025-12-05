'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@clerk/nextjs';
import { Icons } from '@/lib/iconMapping';
import { ShowQRCodeModal } from '@/components/network/ShowQRCodeModal';
import { networkApi } from '@/lib/api';
import { User, Settings, CreditCard, HelpCircle, LogOut, UserCircle, QrCode } from 'lucide-react';
import { UserProfileModal } from '@/components/user/UserProfileModal';

interface UserMenuProps {
  user: any;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user: clerkUser } = useUser();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get image from Clerk (primary source) or fallback to user data
  const userImageUrl = clerkUser?.imageUrl || user?.imageUrl || user?.profileImageUrl;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  const [showQRModal, setShowQRModal] = useState(false);
  const [networkCode, setNetworkCode] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load network code on mount
  useEffect(() => {
    const loadNetworkCode = async () => {
      try {
        // Try to get network code from user data
        if (user?.networkCode) {
          setNetworkCode(user.networkCode);
        } else {
          // Try to generate or fetch it
          try {
            const result = await networkApi.generateCode();
            setNetworkCode(result.networkCode);
          } catch (error) {
            // Silent fail
          }
        }
      } catch (error) {
        // Silent fail
      }
    };
    if (user) {
      loadNetworkCode();
    }
  }, [user]);

  const menuItems = [
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/account/settings',
      onClick: () => setIsOpen(false),
    },
    {
      icon: CreditCard,
      label: 'Subscription',
      href: '/account/subscription',
      onClick: () => setIsOpen(false),
      disabled: true, // Coming soon
    },
    {
      icon: HelpCircle,
      label: 'Contact Support',
      href: '/support',
      onClick: () => setIsOpen(false),
    },
    {
      icon: UserCircle,
      label: 'View Profile',
      href: '#',
      onClick: () => {
        setIsOpen(false);
        setShowProfileModal(true);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-panel/50 transition-colors"
        aria-label="User menu"
      >
        {userImageUrl ? (
          <img
            src={userImageUrl}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full border border-node-volt/30 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-node-volt/20 border border-node-volt/50 flex items-center justify-center text-node-volt font-bold text-sm">
            {userInitial}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-panel thin-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b thin-border">
            <div className="flex items-center gap-3">
              {userImageUrl ? (
                <img
                  src={userImageUrl}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-full border border-node-volt/30 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-node-volt/20 border border-node-volt/50 flex items-center justify-center text-node-volt font-bold">
                  {userInitial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-text truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              if (item.disabled) {
                return (
                  <div
                    key={item.label}
                    className="px-4 py-2 text-sm text-muted-text cursor-not-allowed flex items-center gap-3"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-text">Soon</span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={item.onClick}
                  className="px-4 py-2 text-sm text-text-white hover:bg-node-volt/10 hover:text-node-volt transition-colors flex items-center gap-3"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Show QR Code */}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowQRModal(true);
              }}
              className="w-full px-4 py-2 text-sm text-text-white hover:bg-node-volt/10 hover:text-node-volt transition-colors flex items-center gap-3 text-left"
            >
              <QrCode size={16} />
              <span>Show My QR Code</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t thin-border py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-4 py-2 text-sm text-muted-text hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-3 text-left"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Show QR Code Modal */}
      {showQRModal && (
        <ShowQRCodeModal
          onClose={() => setShowQRModal(false)}
          currentUserNetworkCode={networkCode || undefined}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && user?.id && (
        <UserProfileModal
          userId={user.id}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}


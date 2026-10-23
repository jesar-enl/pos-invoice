'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Package,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/features/auth/context';
import type { Permission } from '@/features/auth/permissions';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { href: '/new-sale', label: 'New Sale', icon: ShoppingCart, permission: 'receipts.create' },
  { href: '/receipts', label: 'Receipts', icon: ReceiptText, permission: 'receipts.view' },
  { href: '/products', label: 'Products', icon: Package, permission: 'products.view' },
  { href: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports.view' },
  { href: '/users', label: 'Users', icon: Users, permission: 'users.manage' },
  { href: '/settings', label: 'Settings', icon: Settings, permission: 'settings.view' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { can } = usePermissions();

  const items = NAV.filter((n) => can(n.permission));

  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-slate-200">
        <span className="font-bold text-slate-800">Invoice POS</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
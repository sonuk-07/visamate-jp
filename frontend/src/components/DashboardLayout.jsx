import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, MessageSquare } from 'lucide-react';

const TABS = [
  { key: 'Dashboard', label: 'Overview', icon: LayoutDashboard, path: '/Dashboard' },
  { key: 'Appointments', label: 'Appointments', icon: Calendar, path: '/AppointmentBooking' },
  { key: 'Applications', label: 'Applications', icon: FileText, path: '/Applications' },
  { key: 'Messages', label: 'Messages', icon: MessageSquare, path: '/Messages' },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();

  const isActiveTab = (tab) => {
    if (tab.path === '/Applications') {
      return location.pathname === '/Applications' || location.pathname === '/NewApplication';
    }
    return location.pathname === tab.path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0ea] pt-24">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1e3a5f]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-72 h-72 bg-[#c9a962]/10 rounded-full blur-3xl" />
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 lg:px-12">
          <nav className="flex gap-1 overflow-x-auto py-1.5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = isActiveTab(tab);
              return (
                <Link
                  key={tab.key}
                  to={tab.path}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#1e3a5f] text-white shadow-md shadow-[#1e3a5f]/20'
                      : 'text-gray-600 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-12 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}

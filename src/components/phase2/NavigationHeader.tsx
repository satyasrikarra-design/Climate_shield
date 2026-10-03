import React, { useState } from "react";
import {
  NavigationTab,
  OperationalRole,
  InAppNotification,
} from "../../types/climate";
import {
  Shield,
  LayoutDashboard,
  Cpu,
  MapPin,
  Map as MapIcon,
  Bell,
  AlertTriangle,
  ClipboardList,
  History,
  BookOpen,
  BarChart3,
  Settings,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  X,
  Radio,
  Building2,
  CheckSquare,
  Wrench,
} from "lucide-react";

interface NavigationHeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeRole: OperationalRole;
  onSelectRole: (role: OperationalRole) => void;
  notifications: InAppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  activeAlertsCount: number;
  criticalIncidentsCount: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  onSelectTab,
  activeRole,
  onSelectRole,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  activeAlertsCount,
  criticalIncidentsCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "command-center",
      label: "Command Center",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "risk-analysis",
      label: "Phase 1 Risk Engine",
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: "locations",
      label: "Locations",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: "map",
      label: "Risk Map",
      icon: <MapIcon className="w-4 h-4" />,
    },
    {
      id: "assets",
      label: "Assets & Vulnerability",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: activeAlertsCount,
    },
    {
      id: "incidents",
      label: "Incidents",
      icon: <ClipboardList className="w-4 h-4" />,
      badge: criticalIncidentsCount,
    },
    {
      id: "tasks",
      label: "Response Tasks",
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: "preparedness",
      label: "Preparedness",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "recovery",
      label: "Recovery",
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      id: "risk-memory",
      label: "Risk Memory",
      icon: <History className="w-4 h-4" />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const roles: { role: OperationalRole; desc: string; color: string }[] = [
    {
      role: "Administrator",
      desc: "Manage users, locations, thresholds & system configuration",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    },
    {
      role: "Risk Analyst",
      desc: "Monitor telemetry, evaluate hazard risks & analyze patterns",
      color: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    },
    {
      role: "Response Operator",
      desc: "Acknowledge alerts, assign action tasks & update incidents",
      color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      role: "Manager",
      desc: "Authorize incident escalations, manage resources & recovery",
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
      {/* Top Utility Bar: Branding, Live Pulse, Role Switcher, Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60">
        {/* Brand & Platform Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                ClimateShield
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide border border-emerald-200/60 dark:border-emerald-800/60">
                Phase 2 Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Smart-City Climate Resilience &amp; Incident Lifecycle Command
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Active Monitoring Heartbeat */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>All India Sensor Grid: Live</span>
          </div>

          {/* Operational Role Switcher (Section 8) */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Role:</span>
              <span>{activeRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showRoleDropdown && (
              <div
                id="role-dropdown-menu"
                className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Operational Role
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Permissions adjust automatically for Phase 2 workflows
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onSelectRole(r.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition cursor-pointer flex flex-col gap-0.5 ${
                        activeRole === r.role
                          ? "bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {r.role}
                        </span>
                        {activeRole === r.role && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-600 text-white font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* In-App Notification Center Bell (Section 16) */}
          <div className="relative">
            <button
              id="notification-center-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleDropdown(false);
              }}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Operational Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                id="notifications-popover"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
              >
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Operational Notifications
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {notifications.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClearAllNotifications}
                      className="text-[11px] text-sky-600 hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No operational notifications at this time
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          if (notif.linkTab) {
                            onSelectTab(notif.linkTab);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          !notif.isRead
                            ? "bg-sky-50/50 dark:bg-sky-950/20 font-medium"
                            : "opacity-75"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary SaaS Navigation Bar (Section 20) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-rose-500 text-white"
                        : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

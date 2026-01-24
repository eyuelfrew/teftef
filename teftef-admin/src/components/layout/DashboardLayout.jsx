import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Search,
    Bell,
    User,
    Megaphone,
    Handshake,
    Settings,
    Package,
    FolderTree,
    Smartphone,
    Tag,
    Shield,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import WarningModal from '../ui/WarningModal';

const SidebarLink = ({ to, icon: Icon, label, collapsed, onClick }) => {
    const commonProps = {
        className: ({ isActive }) =>
            cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                isActive
                    ? "bg-[#0a0a0a] text-white shadow-lg shadow-black/10"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-[#0a0a0a]"
            ),
    };

    if (onClick) {
        return (
            <div onClick={onClick} {...commonProps} className={cn(commonProps.className({ isActive: false }), "cursor-pointer")}>
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", !collapsed && "mr-1")} />
                {!collapsed && <span className="font-medium">{label}</span>}
            </div>
        );
    }

    return (
        <NavLink to={to} {...commonProps}>
            <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", !collapsed && "mr-1")} />
            {!collapsed && <span className="font-medium">{label}</span>}
        </NavLink>
    );
};
const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isWarningModalOpen, setWarningModalOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleUserManagementClick = () => {
        setWarningModalOpen(true);
    };

    const handleProceed = () => {
        setWarningModalOpen(false);
        navigate('/users');
    };

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-neutral-100 transition-all duration-500 ease-in-out flex flex-col p-4 z-20",
                    collapsed ? "w-20" : "w-72"
                )}
            >
                <div className="flex items-center justify-between mb-10 px-2">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-[#0a0a0a]">TEFTEF</span>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-white font-bold">T</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-[#0a0a0a] transition-colors"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
                    <SidebarLink to="/ads" icon={Megaphone} label="Ad Campaigns" collapsed={collapsed} />
                    <SidebarLink to="/form-preview" icon={Smartphone} label="Form Preview" collapsed={collapsed} />
                    <SidebarLink to="/categories" icon={FolderTree} label="Categories" collapsed={collapsed} />
                    <SidebarLink to="/attributes" icon={Tag} label="Attributes" collapsed={collapsed} />
                    <SidebarLink to="/sponsorships" icon={Handshake} label="Partners & Sponsors" collapsed={collapsed} />
                    {user?.is_super_admin && (
                        <>
                            <SidebarLink to="/admins" icon={Shield} label="Admin Management" collapsed={collapsed} />
                            <SidebarLink to="/products" icon={Package} label="Product Listing" collapsed={collapsed} />
                            <SidebarLink to="/users" icon={Users} label="User Management" collapsed={collapsed} onClick={handleUserManagementClick} />
                            <SidebarLink to="/moderation" icon={ShieldCheck} label="Product Moderation" collapsed={collapsed} />
                        </>
                    )}
                </nav>

                <div className="mt-auto pt-4 border-t border-neutral-50 px-2">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold text-center">
                        {collapsed ? "v1.0" : "Teftef Admin v1.0.0"}
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-neutral-100 flex items-center justify-between px-8 z-30">
                    <div className="relative w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#0a0a0a] transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="bg-neutral-50 border-none rounded-xl pl-10 pr-4 py-2 w-full text-sm focus:ring-0 placeholder:text-neutral-400 focus:bg-neutral-100 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-neutral-400 hover:text-[#0a0a0a] hover:bg-neutral-50 rounded-xl transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setProfileOpen(!profileOpen);
                                }}
                                className="flex items-center gap-3 pl-6 border-l border-neutral-100 group transition-all"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-[#0a0a0a] capitalize">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                                        {user?.is_super_admin ? "Super Admin" : "Admin"}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200 group-hover:border-[#0a0a0a] transition-all overflow-hidden">
                                    <User className="text-neutral-400 group-hover:text-[#0a0a0a]" size={20} />
                                </div>
                                <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform duration-300", profileOpen ? "rotate-90 text-[#0a0a0a]" : "group-hover:text-[#0a0a0a]")} />
                            </button>

                            {/* Dropdown Menu */}
                            {profileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
                                        onClick={() => setProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl border border-neutral-100 rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="px-6 py-4 border-b border-neutral-50 mb-2">
                                            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold mb-1">Signed in as</p>
                                            <p className="text-sm font-semibold truncate text-[#0a0a0a]">{user?.email}</p>
                                        </div>

                                        <div className="px-2 space-y-1">
                                            <button
                                                onClick={() => {
                                                    navigate('/admins');
                                                    setProfileOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-[#0a0a0a] rounded-2xl transition-all flex items-center gap-3 group"
                                            >
                                                <div className="p-2 bg-neutral-100 rounded-xl group-hover:bg-[#0a0a0a] group-hover:text-white transition-colors">
                                                    <Users size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[#0a0a0a]">Manage Admins</span>
                                                    <span className="text-[10px] text-neutral-400">Add, edit, or remove admins</span>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="mt-3 px-2 pt-2 border-t border-neutral-50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-3 group font-medium"
                                            >
                                                <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                    <LogOut size={16} />
                                                </div>
                                                Sign Out Account
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {children}
                </div>
            </main>
            <WarningModal
                isOpen={isWarningModalOpen}
                onClose={() => setWarningModalOpen(false)}
                onProceed={handleProceed}
            />
        </div>
    );
};

export default DashboardLayout;

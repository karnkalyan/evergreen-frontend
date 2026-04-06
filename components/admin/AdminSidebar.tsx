import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, Package, Layers, Tag, ShoppingCart, Users,
  Settings, LogOut, ChevronDown, ChevronLeft, ChevronRight,
  Megaphone, FileText, PieChart, Shield, Globe
} from 'lucide-react';

// --- STYLES CONFIGURATION ---
const STYLES = {
  iconActive: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)]",
  iconInactive: "bg-slate-100 text-slate-500 hover:bg-slate-200",
  // We remove the tooltip shadow from here as we will apply it in the portal
};

// --- HELPER COMPONENT: PORTAL TOOLTIP ---
// This renders the content outside the overflow-hidden sidebar
interface TooltipPortalProps {
  children: React.ReactNode;
  parentRef: React.RefObject<HTMLElement>;
  className?: string;
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ children, parentRef, className = "" }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (parentRef.current) {
        const rect = parentRef.current.getBoundingClientRect();
        setCoords({
          // Center vertically relative to the parent
          top: rect.top + rect.height / 2,
          // Position to the right of the parent
          left: rect.right + 10, // 10px spacing
        });
      }
    };

    updatePosition();
    // Update on scroll or resize to keep it attached
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [parentRef]);

  return createPortal(
    <div
      className={`fixed z-[9999] transform -translate-y-1/2 ${className}`}
      style={{ top: coords.top, left: coords.left }}
    >
      {/* Visual styling for the tooltip box */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 text-slate-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200">
        {children}
        {/* Triangle Pointer pointing left */}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-[6px] border-transparent border-r-white/90"></div>
      </div>
    </div>,
    document.body // Render directly into body
  );
};

// --- HELPER COMPONENT: MENU PORTAL ---
// Slightly different styles for the Collapsible Menu popover
const MenuPortal: React.FC<TooltipPortalProps & { onMouseEnter: () => void, onMouseLeave: () => void }> = ({ children, parentRef, onMouseEnter, onMouseLeave }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.right + 10 });
    }
  }, [parentRef]);

  return createPortal(
    <div
      className="fixed z-[9999]"
      style={{ top: coords.top, left: coords.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 text-slate-700 text-sm rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] min-w-[180px] p-1 animate-in fade-in slide-in-from-left-2 duration-200">
         {/* Hover Bridge (invisible div to prevent menu closing when moving mouse) */}
         <div className="absolute right-full top-0 w-4 h-full" />
         {children}
         {/* Triangle */}
         <div className="absolute right-full top-6 border-[6px] border-transparent border-r-white/90"></div>
      </div>
    </div>,
    document.body
  );
};


interface SidebarLinkProps {
  to: string; 
  icon: React.ReactNode; 
  label: string; 
  end?: boolean;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, end, isCollapsed }) => {
    const activeLinkClass = "text-slate-800 font-bold bg-slate-50";
    const inactiveLinkClass = "text-slate-600 hover:bg-slate-50";
    
    // State to handle tooltip visibility
    const [isHovered, setIsHovered] = useState(false);
    const linkRef = useRef<HTMLDivElement>(null);

    return (
        <div 
          className="relative mb-1" 
          ref={linkRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200 ${
                        isActive ? activeLinkClass : inactiveLinkClass
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
            >
                {({ isActive }) => (
                    <>
                        <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? STYLES.iconActive : STYLES.iconInactive}`}>
                            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                        </div>

                        {!isCollapsed && (
                            <span className="text-sm">{label}</span>
                        )}
                    </>
                )}
            </NavLink>
            
            {/* PORTAL TOOLTIP - Only shows when collapsed and hovered */}
            {isCollapsed && isHovered && (
                <TooltipPortal parentRef={linkRef}>
                    {label}
                </TooltipPortal>
            )}
        </div>
    );
};

interface CollapsibleMenuProps {
    title: string; 
    icon: React.ReactNode; 
    links: { to: string, label: string }[];
    defaultOpen?: boolean;
    isCollapsed: boolean;
}

const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({ 
    title, 
    icon, 
    links, 
    defaultOpen = false,
    isCollapsed 
}) => {
    const location = useLocation();
    const isParentActive = links.some(link => location.pathname.startsWith(link.to));
    const [isOpen, setIsOpen] = useState(isParentActive || defaultOpen);
    
    // Hover state for Collapsed Mode
    const [isHovered, setIsHovered] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    return (
        <div 
            className="relative mb-1"
            ref={menuRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between space-x-3 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isParentActive ? 'bg-slate-50 text-slate-800' : 'text-slate-600 hover:bg-slate-50'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
                <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isParentActive ? STYLES.iconActive : STYLES.iconInactive}`}>
                          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                    </div>
                    {!isCollapsed && (
                        <span className={`text-sm ${isParentActive ? 'font-bold' : 'font-semibold'}`}>{title}</span>
                    )}
                </div>
                
                {!isCollapsed && (
                    <ChevronDown className={`w-4 h-4 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {/* PORTAL MENU - Used for collapsed state popup */}
            {isCollapsed && isHovered && (
                <MenuPortal 
                    parentRef={menuRef} 
                    onMouseEnter={() => setIsHovered(true)} 
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="py-1">
                        <div className="px-3 py-2 border-b border-slate-100 font-bold text-slate-800 mb-1">
                            {title}
                        </div>
                        {links.map(link => {
                            const isActive = location.pathname.startsWith(link.to);
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
                                        isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:bg-slate-100'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </MenuPortal>
            )}

            {!isCollapsed && isOpen && (
                <div className="pl-12 pt-1 space-y-1">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `block py-1.5 text-sm transition-all duration-200 ${
                                    isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}

const AdminSidebar: React.FC = () => {
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Logout Hover State
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const logoutRef = useRef<HTMLDivElement>(null);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`relative ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}>
            <aside className={`
                bg-white border-r border-slate-200 flex flex-col h-full
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                {/* Header */}
                <div className="h-20 flex items-center justify-between border-b border-slate-200 px-4 flex-shrink-0">
                    {!isCollapsed ? (
                        <Link to="/admin" className="font-poppins font-bold text-slate-800 flex flex-col leading-tight">
                            <span className="text-2xl">Evergreen</span>
                            <span className="text-xs text-slate-400 uppercase tracking-widest">Admin</span>
                        </Link>
                    ) : (
                        <Link to="/admin" className="font-poppins font-bold text-indigo-600 text-2xl mx-auto">
                            E
                        </Link>
                    )}
                    
                    <button 
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 text-slate-500"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation - Note: overflow-y-auto is kept here, but Portals break out of it */}
                <div className="flex-1 overflow-hidden relative">
                    <nav className="h-full px-2 py-6 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200">
                        <SidebarLink 
                            to="/admin" 
                            icon={<LayoutDashboard />} 
                            label="Dashboard" 
                            end={true}
                            isCollapsed={isCollapsed}
                        />
                        <SidebarLink 
                            to="/admin/products" 
                            icon={<Package />} 
                            label="Products" 
                            isCollapsed={isCollapsed}
                        />
                        <SidebarLink 
                            to="/admin/categories" 
                            icon={<Layers />} 
                            label="Categories" 
                            isCollapsed={isCollapsed}
                        />
                        <SidebarLink 
                            to="/admin/brands" 
                            icon={<Tag />} 
                            label="Brands" 
                            isCollapsed={isCollapsed}
                        />

                        <SidebarLink 
                            to="/admin/orders" 
                            icon={<ShoppingCart />} 
                            label="Sales Orders" 
                            isCollapsed={isCollapsed}
                        />
                        <SidebarLink 
                            to="/admin/customers" 
                            icon={<Users />} 
                            label="Customers" 
                            isCollapsed={isCollapsed}
                        />

                        <div className="pt-4" />

                        <CollapsibleMenu 
                            title="Marketing"
                            icon={<Megaphone />}
                            links={[
                                { to: '/admin/marketing/coupons', label: 'Coupons' },
                            ]}
                            isCollapsed={isCollapsed}
                        />
                        
                        <CollapsibleMenu 
                            title="Content"
                            icon={<FileText />}
                            links={[
                                { to: '/admin/content/blog', label: 'Blog Posts' },
                                { to: '/admin/content/pages', label: 'Pages' },
                                { to: '/admin/content/media', label: 'Media Library' },
                            ]}
                            isCollapsed={isCollapsed}
                        />
                        
                        <CollapsibleMenu 
                            title="Analytics"
                            icon={<PieChart />}
                            links={[
                                { to: '/admin/analytics/reports', label: 'Sales Reports' },
                            ]}
                            isCollapsed={isCollapsed}
                        />

                        <div className="pt-4" />

                        <SidebarLink 
                            to="/admin/users" 
                            icon={<Users />} 
                            label="Users" 
                            isCollapsed={isCollapsed}
                        />
                        <SidebarLink 
                            to="/admin/roles" 
                            icon={<Shield />} 
                            label="Roles" 
                            isCollapsed={isCollapsed}
                        />
                        <SidebarLink 
                            to="/admin/medication-requests" 
                            icon={<FileText />} 
                            label="Medication Requests" 
                            isCollapsed={isCollapsed}
                        />
                         <SidebarLink 
                            to="/admin/contact-request" 
                            icon={<FileText />} 
                            label="Contact Request" 
                            isCollapsed={isCollapsed}
                        />

                           <SidebarLink 
                            to="/admin/about-us" 
                            icon={<Globe />} 
                            label="About Us" 
                            isCollapsed={isCollapsed}
                        />

                        <SidebarLink 
                            to="/admin/settings" 
                            icon={<Settings />} 
                            label="Settings" 
                            isCollapsed={isCollapsed}
                        />
                         <SidebarLink 
                            to="/admin/country" 
                            icon={<Globe />} 
                            label="Country Management" 
                            isCollapsed={isCollapsed}
                        />
                    </nav>
                </div>

                {/* Footer */}
                <div className="px-2 py-6 border-t border-slate-200 flex-shrink-0">
                    <div 
                        className="relative group"
                        ref={logoutRef}
                        onMouseEnter={() => setIsLogoutHovered(true)}
                        onMouseLeave={() => setIsLogoutHovered(false)}
                    >
                        <button 
                            onClick={logout} 
                            className={`
                                w-full flex items-center space-x-3 px-4 py-2 rounded-xl 
                                transition-all duration-200 text-slate-600 hover:bg-red-50 hover:text-red-600
                                ${isCollapsed ? 'justify-center px-2' : ''}
                            `}
                        >
                            <div className={`p-2 rounded-lg transition-all duration-300 ${isLogoutHovered ? 'bg-red-100 text-red-600' : 'bg-slate-100'}`}>
                                <LogOut className="w-5 h-5" />
                            </div>
                            {!isCollapsed && (
                                <span className="font-semibold">Logout</span>
                            )}
                        </button>
                        
                        {/* LOGOUT TOOLTIP VIA PORTAL */}
                        {isCollapsed && isLogoutHovered && (
                            <TooltipPortal parentRef={logoutRef}>
                                Logout
                            </TooltipPortal>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default AdminSidebar;
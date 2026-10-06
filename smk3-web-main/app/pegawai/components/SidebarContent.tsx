'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  AlertTriangle, 
  Ambulance, 
  FolderArchive,
  FileCheck,
  BookOpen,
  UserCircle,
  X,
  Menu,
} from "lucide-react";

const menuItems = [
  { name: "Beranda", href: "/pegawai/dashboard", icon: Home },
  { name: "Lapor", href: "/pegawai/audit", icon: AlertTriangle },
  { name: "Insiden", href: "/pegawai/kecelakaan", icon: Ambulance },
  { name: "Arsip Dokumen", href: "/pegawai/archive", icon: FolderArchive },
  { name: "Evidence SMK3", href: "/pegawai/evidence", icon: FileCheck },
  { name: "Referensi Kriteria", href: "/pegawai/kriteria-referensi", icon: BookOpen },
];

interface SidebarContentProps {
  userName: string;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function SidebarContent({ 
  userName,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarContentProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const checkActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-xl md:translate-x-0 ${
        isCollapsed ? "md:w-20" : "md:w-64"
      } ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full"}`}
    >
      {/* Header User */}
      <div className="h-16 bg-gradient-to-r from-red-800 to-red-700 flex items-center justify-between px-4 shadow-md z-20 shrink-0 border-b border-red-900/20">
        {!isCollapsed || isMobileOpen ? (
          <>
            <div className="flex items-center gap-2.5 text-white overflow-hidden">
              <div className="p-1.5 bg-white/10 rounded-full border border-white/20 shrink-0">
                <UserCircle size={22} />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-xs leading-tight truncate w-28">{userName}</h3>
                <p className="text-[9px] text-red-100 opacity-80 uppercase tracking-wider font-semibold">
                  Pegawai
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-red-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
              title="Kecilkan Menu"
            >
              <Menu size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex mx-auto text-red-100 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
            title="Buka Menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {(!isCollapsed || isMobileOpen) && (
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-3">
            Menu Pegawai
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = checkActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              title={item.name}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm ${
                isCollapsed && !isMobileOpen ? "justify-center" : "justify-start"
              } ${
                isActive
                  ? "bg-red-50 text-red-600 border border-red-100 shadow-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-950/50"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">
                <item.icon size={18} className={isActive ? "text-red-600 dark:text-red-400" : "text-slate-400 group-hover:text-red-600 dark:group-hover:text-white transition-colors"} />
              </div>
              {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

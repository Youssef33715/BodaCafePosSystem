import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiShoppingBag,
  FiList,
  FiGrid,
  FiTag,
  FiFolder,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiX,
  FiTruck,
} from "react-icons/fi";
import { GiCoffeeCup } from "react-icons/gi";
import { useLang } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", key: "dashboard", icon: FiHome },
  { to: "/pos", key: "pos", icon: FiShoppingBag },
  { to: "/orders", key: "orders", icon: FiList },
  { to: "/delivery", key: "delivery", icon: FiTruck },
  { to: "/tables", key: "tables", icon: FiGrid },
  { to: "/menu", key: "menu", icon: FiTag },
  { to: "/categories", key: "categories", icon: FiFolder },
  { to: "/reports", key: "reports", icon: FiBarChart2 },
  { to: "/employees", key: "employees", icon: FiUsers },
];

function SidebarContent({ onNavigate }) {
  const { t } = useLang();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-bg-sidebar">
      <div className="flex items-center gap-3 px-6 py-6 shrink-0">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-2xl text-secondary-light shadow-glow">
          <GiCoffeeCup />
        </div>
        <div className="min-w-0">
          <p className="font-bold font-display text-txt leading-tight truncate">
            {t.appName}
          </p>
          <p className="text-xs text-secondary-light font-medium truncate">
            {t.appSub}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? "bg-gradient-to-tr from-primary-700/90 to-primary-600/70 text-white shadow-glow"
                  : "text-txt-secondary hover:bg-bg-hover hover:text-txt"
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="truncate">{t.nav[item.key]}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="h-9 w-9 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-sm font-bold text-primary-300 shrink-0">
            {user?.name?.[0] || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-txt truncate">
              {user?.name}
            </p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />{" "}
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-bg transition-colors"
        >
          <FiLogOut size={17} />
          {t.common.logout}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { isRTL } = useLang();

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden lg:block w-70 shrink-0 border-e border-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: isRTL ? 320 : -320 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 320 : -320 }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} h-full w-[280px] z-50 lg:hidden shadow-lift`}
            >
              <div className="relative h-full">
                <button
                  onClick={onClose}
                  className="absolute top-5 -start-11 h-9 w-9 rounded-lg bg-bg-sidebar border border-border flex items-center justify-center text-txt"
                  style={{ display: "none" }}
                />
                <SidebarContent onNavigate={onClose} />
                <button
                  onClick={onClose}
                  aria-label="close menu"
                  className="absolute top-5 end-3 h-8 w-8 rounded-lg bg-bg-hover flex items-center justify-center text-txt-secondary"
                >
                  <FiX size={16} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

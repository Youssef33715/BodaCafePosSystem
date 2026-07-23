import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiShoppingBag,
  FiGrid,
  FiCheckCircle,
  FiClock,
  FiPrinter,
  FiPlus,
  FiTag,
  FiSettings,
  FiPackage,
  FiFolder,
} from "react-icons/fi";
import toast from "react-hot-toast";
import MainLayout from "../components/layout/MainLayout";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import { SkeletonCard } from "../components/ui/Skeletons";
import * as dashboardApi from "../api/dashboard";
import { useLang } from "../context/LanguageContext";
import { formatCurrency } from "../utils/format";

// GET /dashboard (services/dashboardService.js) returns EXACTLY:
// { totalSales, totalOrders, activeOrders, completedOrders, occupiedTables,
//   availableTables, totalProducts, totalCategories }
// There is no sales trend, category breakdown, recent-orders list, or
// best-sellers list on this endpoint, so those sections have been removed
// rather than shown with fabricated data.

const quickActions = [
  {
    icon: FiPlus,
    label: "إضافة طلب",
    labelEn: "Add Order",
    to: "/pos",
    color: "from-primary-600 to-primary-800",
  },
  {
    icon: FiPrinter,
    label: "طباعة تقرير",
    labelEn: "Print Report",
    to: "/reports",
    color: "from-info to-blue-700",
  },
  {
    icon: FiShoppingBag,
    label: "فتح نقطة البيع",
    labelEn: "Open POS",
    to: "/pos",
    color: "from-secondary-dark to-secondary",
  },
  {
    icon: FiTag,
    label: "إدارة الأصناف",
    labelEn: "Manage Menu",
    to: "/menu",
    color: "from-success to-emerald-700",
  },
  {
    icon: FiGrid,
    label: "إدارة الطاولات",
    labelEn: "Manage Tables",
    to: "/tables",
    color: "from-warning to-amber-600",
  },
];

export default function Dashboard() {
  const { isRTL, t } = useLang();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setLoading(true);
    dashboardApi
      .getDashboardStats()
      .then(setStats)
      .catch((err) => {
        toast.error(
          err.message ||
            (isRTL
              ? "تعذر تحميل بيانات لوحة التحكم (يتطلب صلاحية admin)"
              : "Failed to load dashboard data (requires admin role)"),
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout
      title={t.nav.dashboard}
      subtitle={
        isRTL
          ? "مرحبًا بك في نظام إدارة كوفي هاوس"
          : "Welcome to your Coffee House management system"
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                icon={FiDollarSign}
                color="green"
                label={isRTL ? "إجمالي المبيعات" : "Total Sales"}
                value={formatCurrency(stats?.totalSales ?? 0)}
              />
              <StatCard
                icon={FiShoppingBag}
                color="blue"
                label={isRTL ? "إجمالي الطلبات" : "Total Orders"}
                value={stats?.totalOrders ?? 0}
              />
              <StatCard
                icon={FiClock}
                color="orange"
                label={isRTL ? "طلبات نشطة" : "Active Orders"}
                value={stats?.activeOrders ?? 0}
              />
              <StatCard
                icon={FiCheckCircle}
                color="purple"
                label={isRTL ? "طلبات مكتملة" : "Completed Orders"}
                value={stats?.completedOrders ?? 0}
              />
              <StatCard
                icon={FiGrid}
                color="red"
                label={isRTL ? "الطاولات المشغولة" : "Occupied Tables"}
                value={stats?.occupiedTables ?? 0}
              />
              <StatCard
                icon={FiGrid}
                color="green"
                label={isRTL ? "الطاولات المتاحة" : "Available Tables"}
                value={stats?.availableTables ?? 0}
              />
              <StatCard
                icon={FiPackage}
                color="blue"
                label={isRTL ? "إجمالي المنتجات" : "Total Products"}
                value={stats?.totalProducts ?? 0}
              />
              <StatCard
                icon={FiFolder}
                color="orange"
                label={isRTL ? "إجمالي الأقسام" : "Total Categories"}
                value={stats?.totalCategories ?? 0}
              />
            </>
          )}
        </div>

        <div>
          <h3 className="font-semibold font-display text-txt mb-3">
            {isRTL ? "إجراءات سريعة" : "Quick Actions"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to}>
                <Card
                  hover
                  className="flex flex-col items-center text-center gap-3 py-6 cursor-pointer h-full"
                >
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white text-xl`}
                  >
                    <a.icon />
                  </div>
                  <p className="text-xs font-medium text-txt-secondary">
                    {isRTL ? a.label : a.labelEn}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

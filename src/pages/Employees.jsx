import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSlash,
  FiKey,
  FiUsers,
  FiShield,
  FiUserCheck,
  FiCoffee,
} from "react-icons/fi";
import MainLayout from "../components/layout/MainLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import DataTable from "../components/ui/DataTable";
import Toggle from "../components/ui/Toggle";
import StatCard from "../components/ui/StatCard";
import { SearchInput } from "../components/ui/SearchInput";
import { Input, Select } from "../components/ui/Input";
import { useLang } from "../context/LanguageContext";
import { useAppData } from "../context/AppDataContext";

const ROLE_LABEL = {
  manager: { ar: "مدير", en: "Manager" },
  cashier: { ar: "كاشير", en: "Cashier" },
  chef: { ar: "المطبخ", en: "Chef" },
};

const PERMISSIONS = [
  "dashboard",
  "pos",
  "orders",
  "reports",
  "menu",
  "categories",
  "tables",
  "users",
];
const PERMISSION_LABEL_AR = {
  dashboard: "الرئيسية",
  pos: "نقطة البيع",
  orders: "الطلبات",
  reports: "التقارير",
  menu: "الأصناف",
  categories: "الأقسام",
  tables: "الطاولات",
  users: "المستخدمين",
};

export default function Employees() {
  const { isRTL, t } = useLang();
  const { employees, addEmployee, updateEmployee, deleteEmployee } =
    useAppData();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [permissions, setPermissions] = useState(() =>
    Object.fromEntries(PERMISSIONS.map((p) => [p, true])),
  );

  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const status = watch("status");

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = query.trim();
      const matchesQuery = !q || e.name.includes(q) || e.phone.includes(q);
      const matchesRole = roleFilter === "all" || e.role === roleFilter;
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [employees, query, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: employees.length,
      managers: employees.filter((e) => e.role === "manager").length,
      cashiers: employees.filter((e) => e.role === "cashier").length,
      active: employees.filter((e) => e.status === "active").length,
    }),
    [employees],
  );

  const openCreate = () => {
    reset({
      name: "",
      phone: "",
      email: "",
      role: "cashier",
      status: "active",
    });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    addEmployee({
      ...data,
      roleLabel: isRTL ? ROLE_LABEL[data.role].ar : ROLE_LABEL[data.role].en,
      createdAt: new Date().toISOString().slice(0, 10),
      avatarColor: "#8B5CF6",
    });
    toast.success(isRTL ? "تمت إضافة الموظف" : "Employee added");
    setModalOpen(false);
  };

  const columns = [
    {
      key: "photo",
      label: isRTL ? "الموظف" : "Employee",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: r.avatarColor }}
          >
            {r.name[0]}
          </div>
          <span className="font-medium text-txt">{r.name}</span>
        </div>
      ),
    },
    { key: "phone", label: isRTL ? "رقم الهاتف" : "Phone" },
    { key: "email", label: isRTL ? "البريد الإلكتروني" : "Email" },
    {
      key: "role",
      label: isRTL ? "الوظيفة" : "Role",
      render: (r) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-600/15 text-primary-300">
          {r.roleLabel}
        </span>
      ),
    },
    {
      key: "status",
      label: t.common.status,
      render: (r) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === "active" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
        >
          {r.status === "active"
            ? isRTL
              ? "نشط"
              : "Active"
            : isRTL
              ? "غير نشط"
              : "Inactive"}
        </span>
      ),
    },
    { key: "createdAt", label: isRTL ? "تاريخ الإضافة" : "Created" },
    {
      key: "actions",
      label: t.common.actions,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setProfileTarget(r)}
            className="h-7 w-7 rounded-md bg-bg-hover text-info flex items-center justify-center"
          >
            <FiEye size={13} />
          </button>
          <button className="h-7 w-7 rounded-md bg-bg-hover text-primary-400 flex items-center justify-center">
            <FiEdit2 size={13} />
          </button>
          <button
            onClick={() => {
              updateEmployee(r.id, {
                status: r.status === "active" ? "inactive" : "active",
              });
              toast.success(isRTL ? "تم تحديث الحالة" : "Status updated");
            }}
            className="h-7 w-7 rounded-md bg-bg-hover text-warning flex items-center justify-center"
          >
            <FiSlash size={13} />
          </button>
          <button
            onClick={() => setDeleteTarget(r)}
            className="h-7 w-7 rounded-md bg-bg-hover text-danger flex items-center justify-center"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      title={isRTL ? "الموظفين" : "Employees"}
      subtitle={
        isRTL
          ? "إدارة حسابات الموظفين والصلاحيات"
          : "Manage staff accounts & permissions"
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiUsers}
            color="purple"
            label={isRTL ? "إجمالي الموظفين" : "Total Employees"}
            value={stats.total}
          />
          <StatCard
            icon={FiShield}
            color="green"
            label={isRTL ? "مدراء النظام" : "Admins"}
            value={stats.managers}
          />
          <StatCard
            icon={FiCoffee}
            color="blue"
            label={isRTL ? "الكاشير" : "Cashiers"}
            value={stats.cashiers}
          />
          <StatCard
            icon={FiUserCheck}
            color="orange"
            label={isRTL ? "نشط" : "Active"}
            value={stats.active}
          />
        </div>

        <Card className="!p-4">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={isRTL ? "بحث عن موظف..." : "Search employee..."}
              className="flex-1"
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="lg:w-48"
            >
              <option value="all">{isRTL ? "كل الوظائف" : "All roles"}</option>
              <option value="manager">{isRTL ? "مدير" : "Manager"}</option>
              <option value="cashier">{isRTL ? "كاشير" : "Cashier"}</option>
              <option value="chef">{isRTL ? "المطبخ" : "Chef"}</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="lg:w-48"
            >
              <option value="all">
                {isRTL ? "كل الحالات" : "All statuses"}
              </option>
              <option value="active">{isRTL ? "نشط" : "Active"}</option>
              <option value="inactive">{isRTL ? "غير نشط" : "Inactive"}</option>
            </Select>
            <Button icon={FiPlus} onClick={openCreate}>
              {isRTL ? "إضافة موظف جديد" : "Add Employee"}
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={filtered}
            emptyTitle={isRTL ? "لا يوجد موظفين" : "No employees"}
          />
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isRTL ? "إضافة موظف جديد" : "Add New Employee"}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>{t.common.save}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={isRTL ? "الاسم الكامل" : "Full Name"}
            {...register("name", { required: true })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={isRTL ? "رقم الهاتف" : "Phone"}
              {...register("phone", { required: true })}
            />
            <Input
              label={isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
              type="email"
              {...register("email")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label={isRTL ? "الوظيفة" : "Role"} {...register("role")}>
              <option value="manager">{isRTL ? "مدير" : "Manager"}</option>
              <option value="cashier">{isRTL ? "كاشير" : "Cashier"}</option>
              <option value="chef">{isRTL ? "المطبخ" : "Chef"}</option>
            </Select>
            <Input
              label={isRTL ? "كلمة المرور" : "Password"}
              type="password"
              {...register("password")}
            />
          </div>
          <Toggle
            checked={status !== "inactive"}
            onChange={(v) => setValue("status", v ? "active" : "inactive")}
            label={isRTL ? "نشط" : "Active"}
          />

          <div className="pt-2 border-t border-border">
            <p className="text-sm font-medium text-txt-secondary mb-2">
              {isRTL ? "الصلاحيات" : "Permissions"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PERMISSIONS.map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between bg-bg-sidebar rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-txt-secondary">
                    {isRTL ? PERMISSION_LABEL_AR[p] : p}
                  </span>
                  <Toggle
                    checked={permissions[p]}
                    onChange={(v) =>
                      setPermissions((prev) => ({ ...prev, [p]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!profileTarget}
        onClose={() => setProfileTarget(null)}
        title={isRTL ? "الملف الشخصي" : "Employee Profile"}
        size="sm"
      >
        {profileTarget && (
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: profileTarget.avatarColor }}
            >
              {profileTarget.name[0]}
            </div>
            <div>
              <p className="text-lg font-bold text-txt">{profileTarget.name}</p>
              <p className="text-sm text-txt-secondary">
                {profileTarget.roleLabel}
              </p>
            </div>
            <div className="w-full grid grid-cols-2 gap-3 text-start mt-3">
              <div className="bg-bg-sidebar rounded-lg p-3">
                <p className="text-xs text-txt-muted">
                  {isRTL ? "الهاتف" : "Phone"}
                </p>
                <p className="text-sm text-txt mt-0.5">{profileTarget.phone}</p>
              </div>
              <div className="bg-bg-sidebar rounded-lg p-3">
                <p className="text-xs text-txt-muted">
                  {isRTL ? "البريد" : "Email"}
                </p>
                <p className="text-sm text-txt mt-0.5 truncate">
                  {profileTarget.email}
                </p>
              </div>
              <div className="bg-bg-sidebar rounded-lg p-3">
                <p className="text-xs text-txt-muted">
                  {isRTL ? "الحالة" : "Status"}
                </p>
                <p className="text-sm text-txt mt-0.5">
                  {profileTarget.status === "active"
                    ? isRTL
                      ? "نشط"
                      : "Active"
                    : isRTL
                      ? "غير نشط"
                      : "Inactive"}
                </p>
              </div>
              <div className="bg-bg-sidebar rounded-lg p-3">
                <p className="text-xs text-txt-muted">
                  {isRTL ? "تاريخ الإضافة" : "Joined"}
                </p>
                <p className="text-sm text-txt mt-0.5">
                  {profileTarget.createdAt}
                </p>
              </div>
            </div>
            <Button variant="dark" icon={FiKey} fullWidth>
              {isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password"}
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteEmployee(deleteTarget.id);
          toast.success(isRTL ? "تم حذف الموظف" : "Employee deleted");
        }}
        title={isRTL ? "حذف الموظف" : "Delete Employee"}
        message={
          isRTL
            ? `هل أنت متأكد من حذف "${deleteTarget?.name}"؟`
            : `Delete "${deleteTarget?.name}"?`
        }
      />
    </MainLayout>
  );
}

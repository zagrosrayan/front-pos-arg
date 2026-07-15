'use client'

import { ROLE_LABEL, ROLE_MANAGEMENT_LABEL } from '@/app/constant/label'
import FormLayout from '@/app/layout/FormLayout'
import { apiRequest } from '@/lib/axios'
import { ROLE_API } from '@/routes/api/role'
import { Button, Checkbox, CheckboxGroup, Spinner } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormSelect from '@/app/components/ui/FormSelect'

/* ═══════════════════════════════════════════════════════════════
   تایپ‌ها
   ═══════════════════════════════════════════════════════════════ */

type RoleFormProps = {
  role: string
}

interface Permission {
  id: number
  name: string
  guard_name: string
}

interface Role {
  id: number
  name: string
  guard_name: string
  permissions: Permission[]
}

interface PermissionCategory {
  label: string
  permissions: {
    name: string
    label: string
  }[]
}

/* ═══════════════════════════════════════════════════════════════
   دسته‌بندی دسترسی‌ها
   ═══════════════════════════════════════════════════════════════ */

const permissionCategories: PermissionCategory[] = [
  {
    label: 'ورود',
    permissions: [{ name: 'login', label: 'ورود به سیستم' }],
  },
  {
    label: 'سفارشات',
    permissions: [
      { name: 'manage_orders', label: 'مدیریت سفارشات' },
      { name: 'create_guest_order', label: 'ایجاد سفارش مهمان' },
      { name: 'create_resident_order', label: 'ایجاد سفارش مقیم' },
      { name: 'update_order', label: 'ویرایش سفارش' },
      { name: 'delete_order', label: 'حذف سفارش' },
      { name: 'complete_order', label: 'تکمیل سفارش' },
    ],
  },
  {
    label: 'غذاها',
    permissions: [
      { name: 'manage_foods', label: 'مدیریت غذاها' },
      { name: 'manage_food', label: 'مدیریت غذا' },
      { name: 'food_report', label: 'گزارش غذاها' },
    ],
  },
  {
    label: 'دسته‌بندی',
    permissions: [
      { name: 'manage_articles', label: 'مدیریت مقالات' },
      { name: 'manage_article', label: 'مدیریت دسته‌بندی' },
    ],
  },
  {
    label: 'مرکز درآمد',
    permissions: [
      { name: 'manage_profit_manager', label: 'مدیریت مرکز درآمد' },
    ],
  },
  {
    label: 'مشتریان',
    permissions: [{ name: 'view_customer', label: 'مشاهده مشتریان' }],
  },
  {
    label: 'تخفیف‌ها',
    permissions: [
      { name: 'manage_discounts', label: 'مدیریت تخفیف‌ها' },
      { name: 'view_discount', label: 'مشاهده تخفیف‌ها' },
    ],
  },
  {
    label: 'کاربران',
    permissions: [
      { name: 'view_users', label: 'مشاهده کاربران' },
      { name: 'manage_users', label: 'مدیریت کاربران' },
      { name: 'manage_roles', label: 'مدیریت نقش‌ها' },
    ],
  },
  {
    label: 'تنظیمات',
    permissions: [
      { name: 'update_settings', label: 'بروزرسانی تنظیمات' },
      { name: 'manage_types', label: 'مدیریت انواع' },
      { name: 'view_logs', label: 'مشاهده لاگ‌ها' },
    ],
  },
  {
    label: 'پرینتر',
    permissions: [
      { name: 'manage_printers', label: 'مدیریت پرینترها' },
      { name: 'view_printer', label: 'مشاهده پرینترها' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════
   کامپوننت اصلی
   ═══════════════════════════════════════════════════════════════ */

const RolesPage = () => {
  const methods = useForm<RoleFormProps>({
    mode: 'onChange',
  })

  const selectedRoleName = useWatch({
    control: methods.control,
    name: 'role',
  })

  const [rolesData, setRolesData] = useState<Role[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /* ═══════════════════════════════════════════════════════════════
     دریافت لیست نقش‌ها با دسترسی‌ها
     ═══════════════════════════════════════════════════════════════ */

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<{ data: Role[] }>(ROLE_API.getAll())
        const roles = response?.data?.data || []
        setRolesData(roles)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
        toast.error('خطا در دریافت لیست نقش‌ها')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

  /* ═══════════════════════════════════════════════════════════════
     وقتی نقش انتخاب میشه، دسترسی‌هاش رو بگیر
     ═══════════════════════════════════════════════════════════════ */

  useEffect(() => {
    if (selectedRoleName && rolesData.length > 0) {
      const role = rolesData.find((r) => r.name === selectedRoleName)
      if (role) {
        const permissions = role.permissions.map((p) => p.name)
        setSelectedPermissions(permissions)
      }
    }
  }, [selectedRoleName, rolesData])

  /* ═══════════════════════════════════════════════════════════════
     انتخاب/عدم انتخاب همه دسترسی‌های یک دسته
     ═══════════════════════════════════════════════════════════════ */

  const handleCategoryToggle = (category: PermissionCategory) => {
    const categoryPermissionNames = category.permissions.map((p) => p.name)
    const allSelected = categoryPermissionNames.every((name) =>
      selectedPermissions.includes(name)
    )

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((name) => !categoryPermissionNames.includes(name))
      )
    } else {
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...categoryPermissionNames]),
      ])
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     بررسی وضعیت چک‌باکس دسته
     ═══════════════════════════════════════════════════════════════ */

  const getCategoryCheckState = (category: PermissionCategory) => {
    const categoryPermissionNames = category.permissions.map((p) => p.name)
    const selectedCount = categoryPermissionNames.filter((name) =>
      selectedPermissions.includes(name)
    ).length

    if (selectedCount === 0) return 'none'
    if (selectedCount === categoryPermissionNames.length) return 'all'
    return 'some'
  }

  /* ═══════════════════════════════════════════════════════════════
     ذخیره تغییرات
     ═══════════════════════════════════════════════════════════════ */

  const handleSave = async () => {
    if (!selectedRoleName) {
      toast.error('لطفاً یک نقش انتخاب کنید')
      return
    }

    setIsSaving(true)
    console.log('Role:', selectedRoleName)
    console.log('Permissions:', selectedPermissions)
    // TODO: ارسال به API
    toast.success('دسترسی‌ها با موفقیت ذخیره شد')
    setIsSaving(false)
  }

  const handleSubmit = async (data: RoleFormProps) => {
    console.log('Selected Role:', data)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-5 p-5"
      style={{ maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}
    >
      <h1 className="text-2xl font-bold text-default-700">
        {ROLE_MANAGEMENT_LABEL}
      </h1>

      {/* انتخاب نقش */}
      <FormLayout<RoleFormProps>
        onSubmit={handleSubmit}
        methods={methods}
        className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <FormSelect<RoleFormProps>
          name="role"
          apiMethods={ROLE_API}
          label={ROLE_LABEL}
          keyIndex="name"
          valueIndex="name"
          labelIndex="name"
        />
      </FormLayout>

      {/* لیست دسترسی‌ها */}
      <div className="flex flex-col gap-4">
        {permissionCategories.map((category) => {
          const checkState = getCategoryCheckState(category)

          return (
            <div
              key={category.label}
              className="rounded-lg border-2 border-default-100 p-4"
            >
              <div className="mb-3 border-b border-default-100 pb-3">
                <Checkbox
                  isSelected={checkState === 'all'}
                  isIndeterminate={checkState === 'some'}
                  onValueChange={() => handleCategoryToggle(category)}
                  color="success"
                >
                  <span className="font-semibold text-default-700">
                    {category.label}
                  </span>
                </Checkbox>
              </div>

              <CheckboxGroup
                value={selectedPermissions}
                onValueChange={setSelectedPermissions}
                orientation="horizontal"
                classNames={{
                  wrapper: 'flex flex-wrap gap-4 pr-6',
                }}
              >
                {category.permissions.map((permission) => (
                  <Checkbox
                    key={permission.name}
                    value={permission.name}
                    color="success"
                  >
                    {permission.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>
          )
        })}

        {/* دکمه ذخیره */}
        <div className="flex justify-end py-4">
          <Button
            color="success"
            className="text-white"
            size="lg"
            onPress={handleSave}
            isLoading={isSaving}
          >
            ذخیره تغییرات
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RolesPage

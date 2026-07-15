import DashboardLayout from '../../layout/DashboardLayout'

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardLayout>{children}</DashboardLayout>
}

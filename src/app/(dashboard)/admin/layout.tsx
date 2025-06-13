import CollapsibleLayout from '@/components/layout/CollapsibleLayout';
import AdminSidebar from '@/components/layout/Sidebar/AdminSidebar';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<CollapsibleLayout sidebar={<AdminSidebar />}>{children}</CollapsibleLayout>
	);
}

import { createMetadata } from '@/app/metadata';
import CollapsibleLayout from '@/components/layout/CollapsibleLayout';
import AdminSidebar from '@/components/layout/Sidebar/admin/AdminSidebar';

export const metadata = createMetadata({
	title: 'Admin Dashboard',
	description:
		'Admin Dashboard for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return (
		<CollapsibleLayout sidebar={<AdminSidebar />}>{children}</CollapsibleLayout>
	);
}

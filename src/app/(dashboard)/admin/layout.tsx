import Header from '@/components/common/Header';
import AdminSidebar from '@/components/layout/Sidebar/AdminSidebar';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<header className="fixed top-0 left-0 w-full z-50">
				<Header userRole="Admin" avatarSrc="/images/Avatar.png" />
			</header>

			<div className="pt-12 flex">
				<aside className="fixed top-12 left-0 w-60 h-[calc(100vh-3rem)] bg-white shadow-md z-40">
					<AdminSidebar />
				</aside>

				<main className="ml-60 flex-1 p-5">{children}</main>
			</div>
		</div>
	);
}

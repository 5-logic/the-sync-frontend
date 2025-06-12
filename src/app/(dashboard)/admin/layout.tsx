import AdminHeader from '@/components/layout/Header/AdminHeader';
import AdminSidebar from '@/components/layout/Sidebar/AdminSidebar';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<header className="fixed top-0 left-0 w-full z-50">
				<AdminHeader />
			</header>

			<div className="pt-16 flex">
				<aside className="fixed top-12 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-md z-40">
					<AdminSidebar />
				</aside>

				<main className="ml-64 flex-1 p-5">
					<h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
					{children}
				</main>
			</div>
		</div>
	);
}

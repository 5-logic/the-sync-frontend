import Header from '@/components/common/Header';
import LecturerSidebar from '@/components/layout/Sidebar/LecturerSidebar';

export default function LecturerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<header className="fixed top-0 left-0 w-full z-50">
				<Header userRole="Lecturer" avatarSrc="/images/Avatar.png" />
			</header>

			<div className="pt-12 flex">
				<aside className="fixed top-12 left-0 w-60 h-[calc(100vh-3rem)] bg-white shadow-md z-40">
					<LecturerSidebar />
				</aside>

				<main className="ml-60 flex-1 p-5">{children}</main>
			</div>
		</div>
	);
}

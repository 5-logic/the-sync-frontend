import CollapsibleLayout from '@/components/layout/CollapsibleLayout';
import LecturerSidebar from '@/components/layout/Sidebar/LecturerSidebar';

export default function LecturerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<CollapsibleLayout sidebar={<LecturerSidebar />}>
			{children}
		</CollapsibleLayout>
	);
}

import CollapsibleLayout from '@/components/layout/CollapsibleLayout';
import LecturerSidebar from '@/components/layout/Sidebar/lecturer/LecturerSidebar';

export default function LecturerLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return (
		<CollapsibleLayout sidebar={<LecturerSidebar />}>
			{children}
		</CollapsibleLayout>
	);
}

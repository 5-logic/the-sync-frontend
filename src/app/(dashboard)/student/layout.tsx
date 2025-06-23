import CollapsibleLayout from '@/components/layout/CollapsibleLayout';
import StudentSidebar from '@/components/layout/Sidebar/student/StudentSidebar';

export default function StudentLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return (
		<CollapsibleLayout sidebar={<StudentSidebar />}>
			{children}
		</CollapsibleLayout>
	);
}

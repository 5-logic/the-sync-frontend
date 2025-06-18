import ThesisManagement from '@/components/features/lecturer/ThesisManagement';

export default function LecturerThesisManagementPage() {
	return (
		<div className="p-6">
			{/* <h1 className="text-2xl font-bold mb-4">Thesis Management</h1>
			<p className="text-gray-600">Manage your thesis topics and proposals</p> */}

			<ThesisManagement />
		</div>
	);
}

// import { createMetadata } from '@/app/metadata';
// import ThesisManagement from '@/components/features/lecturer/ThesisManagement';

// export const metadata = createMetadata({
// 	title: 'Lecturer Thesis Management',
// 	description:
// 		'Lecturer Thesis Management for TheSync - Group Formation and Capstone Thesis Development',
// });

// export default function AdminLectureManagementPage() {
// 	return <ThesisManagement />;
// }

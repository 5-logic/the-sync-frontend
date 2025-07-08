import { createMetadata } from '@/app/metadata';

export const metadata = createMetadata({
	title: 'Student View List Thesis',
	description:
		'Student View List Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

export default function AdminThesisManagementPage() {
	return <ViewListThesis />;
}

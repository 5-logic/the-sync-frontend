import { createMetadata } from '@/app/metadata';
import ChecklistDetail from '@/components/features/lecturer/ChecklistDetail';

export const metadata = createMetadata({
	title: 'Lecturer View Checklist Detail',
	description:
		'Lecturer View Checklist Detail for TheSync - Group Formation and Capstone Thesis Development',
});

export default function ChecklistDetailPage() {
	return <ChecklistDetail />;
}

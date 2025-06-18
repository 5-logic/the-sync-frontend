import { createMetadata } from '@/app/metadata';
import SemesterSettingsClient from '@/components/pages/admin/SemesterSettingsClient';

export const metadata = createMetadata({
	title: 'Admin Semester Settings',
	description:
		'Admin Semester Settings for TheSync - Group Formation and Capstone Thesis Development',
});

export default function Page() {
	return <SemesterSettingsClient />;
}

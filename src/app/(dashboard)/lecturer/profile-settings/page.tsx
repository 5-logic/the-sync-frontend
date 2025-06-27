import { createMetadata } from '@/app/metadata';
import ProfileSettingsPage from '@/components/features/lecturer/ProfileSetting';

export const metadata = createMetadata({
	title: 'Lecturer Profile Settings',
	description:
		'Lecturer Profile Settings for TheSync - Group Formation and Capstone Thesis Development',
});

export default function LecturerProfileSettingsPage() {
	return <ProfileSettingsPage />;
}

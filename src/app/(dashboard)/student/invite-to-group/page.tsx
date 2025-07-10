import { createMetadata } from '@/app/metadata';
import InviteToGroup from '@/components/features/student/InviteToGroup';

export const metadata = createMetadata({
	title: 'Student Invite To Group',
	description:
		'Student Invite other students to join your group - Group Formation and Capstone Thesis Development',
});

export default function StudentInviteToGroupPage() {
	return <InviteToGroup />;
}

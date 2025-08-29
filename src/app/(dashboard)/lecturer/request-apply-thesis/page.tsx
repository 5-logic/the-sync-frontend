import { createMetadata } from '@/app/metadata';
import RequestApplyThesisClient from '@/components/pages/lecturer/RequestApplyThesisClient';

export const metadata = createMetadata({
	title: 'Request Apply Thesis',
	description:
		'Request Apply Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

export default function RequestApplyThesisPage() {
	return <RequestApplyThesisClient />;
}

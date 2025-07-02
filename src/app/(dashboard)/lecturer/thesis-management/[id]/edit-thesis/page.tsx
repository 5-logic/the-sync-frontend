import { createMetadata } from '@/app/metadata';
import EditThesis from '@/components/features/lecturer/EditThesis';

export const metadata = createMetadata({
	title: 'Edit Thesis',
	description:
		'Edit Thesis for TheSync - Group Formation and Capstone Thesis Development',
});

interface Props {
	params: {
		id: string;
	};
}

export default function EditThesisPage({ params }: Props) {
	return <EditThesis thesisId={params.id} />;
}

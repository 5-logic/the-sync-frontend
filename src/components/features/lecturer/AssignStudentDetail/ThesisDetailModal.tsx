'use client';

import { Modal } from 'antd';

import ThesisInfoCard from '@/components/features/lecturer/ViewThesisDetail/ThesisInfoCard';
import { Thesis } from '@/schemas/thesis';

interface Props {
	readonly open: boolean;
	readonly onCancel: () => void;
	readonly thesis: Thesis | null;
}

export default function ThesisDetailModal({ open, onCancel, thesis }: Props) {
	if (!thesis) return null;

	return (
		<Modal
			title="Thesis Details"
			open={open}
			onCancel={onCancel}
			footer={null}
			width={800}
			destroyOnClose
		>
			<ThesisInfoCard thesis={thesis} />
		</Modal>
	);
}

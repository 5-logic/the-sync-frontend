'use client';

import { DisconnectOutlined } from '@ant-design/icons';
import { Button, Modal, Space } from 'antd';

import ThesisInfoCard from '@/components/features/lecturer/ViewThesisDetail/ThesisInfoCard';
import { Thesis } from '@/schemas/thesis';

interface Props {
	readonly open: boolean;
	readonly onCancel: () => void;
	readonly thesis: Thesis | null;
	readonly onUnassignThesis?: () => void;
	readonly showUnassignButton?: boolean;
}

export default function ThesisDetailModal({
	open,
	onCancel,
	thesis,
	onUnassignThesis,
	showUnassignButton = false,
}: Props) {
	if (!thesis) return null;

	return (
		<Modal
			title="Thesis Details"
			open={open}
			onCancel={onCancel}
			footer={
				<Space>
					<Button onClick={onCancel}>Close</Button>
					{showUnassignButton && (
						<Button
							type="primary"
							danger
							icon={<DisconnectOutlined />}
							onClick={onUnassignThesis}
						>
							Unassign Thesis
						</Button>
					)}
				</Space>
			}
			width={800}
			destroyOnClose
		>
			<ThesisInfoCard thesis={thesis} />
		</Modal>
	);
}

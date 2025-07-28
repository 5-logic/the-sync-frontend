'use client';

import { Modal, Typography } from 'antd';

import { Thesis } from '@/schemas/thesis';

const { Text } = Typography;

interface Props {
	readonly open: boolean;
	readonly onCancel: () => void;
	readonly onConfirm: () => void;
	readonly thesis: Thesis | null;
	readonly groupName: string;
	readonly loading?: boolean;
}

export default function AssignThesisModal({
	open,
	onCancel,
	onConfirm,
	thesis,
	groupName,
	loading = false,
}: Props) {
	if (!thesis) return null;

	return (
		<Modal
			title="Confirm Thesis Assignment"
			open={open}
			onOk={onConfirm}
			onCancel={onCancel}
			confirmLoading={loading}
			okText="Assign Thesis"
			cancelText="Cancel"
		>
			<div className="space-y-4">
				<div>
					<Text strong>
						Are you sure you want to assign this thesis to the group?
					</Text>
				</div>

				<div>
					<Text strong>Thesis:</Text>
					<div className="ml-4 mt-1">
						<div>
							<Text strong>English:</Text> {thesis.englishName}
						</div>
						<div>
							<Text strong>Vietnamese:</Text> {thesis.vietnameseName}
						</div>
						<div>
							<Text strong>Abbreviation:</Text> {thesis.abbreviation}
						</div>
					</div>
				</div>

				<div>
					<Text strong>Group:</Text> {groupName}
				</div>
			</div>
		</Modal>
	);
}

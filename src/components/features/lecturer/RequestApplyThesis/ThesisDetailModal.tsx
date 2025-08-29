'use client';

import { Descriptions, Modal, Tag, Typography } from 'antd';

import { getOrientationDisplay } from '@/lib/constants/orientation';
import { ThesisWithRequests } from '@/types/thesis-requests';

const { Paragraph, Title } = Typography;

interface Props {
	readonly open: boolean;
	readonly onClose: () => void;
	readonly thesis: ThesisWithRequests['thesis'] | null;
}

export default function ThesisDetailModal({ open, onClose, thesis }: Props) {
	if (!thesis) return null;

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Approved':
				return 'success';
			case 'Rejected':
				return 'error';
			case 'Pending':
				return 'warning';
			default:
				return 'default';
		}
	};

	const orientationDisplay = getOrientationDisplay(thesis.orientation);

	return (
		<Modal
			title={<Title level={4}>Thesis Details</Title>}
			open={open}
			onCancel={onClose}
			footer={null}
			width={800}
			centered
		>
			<Descriptions bordered column={1} size="middle">
				<Descriptions.Item label="English Name">
					<strong>{thesis.englishName}</strong>
				</Descriptions.Item>
				<Descriptions.Item label="Vietnamese Name">
					<strong>{thesis.vietnameseName}</strong>
				</Descriptions.Item>
				<Descriptions.Item label="Abbreviation">
					<Tag color="blue">{thesis.abbreviation}</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="Orientation">
					{orientationDisplay ? (
						<Tag color={orientationDisplay.color}>
							{orientationDisplay.label}
						</Tag>
					) : (
						<span>-</span>
					)}
				</Descriptions.Item>
				<Descriptions.Item label="Domain">
					<Tag color="cyan">{thesis.domain}</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="Status">
					<Tag color={getStatusColor(thesis.status)}>{thesis.status}</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="Published">
					<Tag color={thesis.isPublish ? 'success' : 'error'}>
						{thesis.isPublish ? 'Yes' : 'No'}
					</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="Lecturer">
					<div>
						<div>
							<strong>{thesis.lecturer.user.fullName}</strong>
						</div>
						<div style={{ color: '#666' }}>{thesis.lecturer.user.email}</div>
						<div style={{ color: '#666' }}>
							{thesis.lecturer.user.phoneNumber}
						</div>
						{thesis.lecturer.isModerator && (
							<Tag color="gold" style={{ marginTop: 4 }}>
								Moderator
							</Tag>
						)}
					</div>
				</Descriptions.Item>
				<Descriptions.Item label="Semester">
					<div>
						<div>
							<strong>{thesis.semester.name}</strong> ({thesis.semester.code})
						</div>
						<div style={{ color: '#666' }}>
							Status: {thesis.semester.status}
						</div>
						<div style={{ color: '#666' }}>
							Max Theses: {thesis.semester.defaultThesesPerLecturer} /{' '}
							{thesis.semester.maxThesesPerLecturer}
						</div>
					</div>
				</Descriptions.Item>
				<Descriptions.Item label="Description">
					<Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
						{thesis.description}
					</Paragraph>
				</Descriptions.Item>
				<Descriptions.Item label="Created At">
					{new Date(thesis.createdAt).toLocaleString()}
				</Descriptions.Item>
				<Descriptions.Item label="Updated At">
					{new Date(thesis.updatedAt).toLocaleString()}
				</Descriptions.Item>
			</Descriptions>
		</Modal>
	);
}

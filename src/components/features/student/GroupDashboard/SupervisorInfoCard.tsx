'use client';

import { UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, Typography } from 'antd';
import { useEffect } from 'react';

import {
	LecturerInfo,
	useSupervisionsStore,
} from '@/store/useSupervisionsStore';

const { Text } = Typography;

interface SupervisorInfoCardProps {
	readonly thesisId: string | undefined;
}

export default function SupervisorInfoCard({
	thesisId,
}: SupervisorInfoCardProps) {
	const { supervisors, loading, fetchSupervisors } = useSupervisionsStore();

	useEffect(() => {
		if (thesisId) {
			fetchSupervisors(thesisId);
		}
	}, [thesisId, fetchSupervisors]);

	const renderSupervisor = (supervisor: LecturerInfo | null, index: number) => (
		<Col span={12} key={index}>
			<Card size="small" style={{ height: '100%' }}>
				<Space direction="vertical" size="small" style={{ width: '100%' }}>
					<Space direction="vertical" size={2}>
						<Text strong>Name</Text>
						<Text>{supervisor?.fullName || 'Not assigned'}</Text>
					</Space>

					<Space direction="vertical" size={2}>
						<Text strong>Email</Text>
						<Text>{supervisor?.email || 'N/A'}</Text>
					</Space>

					<Space direction="vertical" size={2}>
						<Text strong>Phone number</Text>
						<Text>{supervisor?.phoneNumber || 'N/A'}</Text>
					</Space>
				</Space>
			</Card>
		</Col>
	);

	return (
		<Card
			title={
				<Space>
					<UserOutlined />
					<span>Supervisor Information</span>
				</Space>
			}
			loading={loading}
		>
			<Row gutter={16}>
				{renderSupervisor(supervisors[0] || null, 0)}
				{renderSupervisor(supervisors[1] || null, 1)}
			</Row>
		</Card>
	);
}

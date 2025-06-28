'use client';

import { Card, Col, Row, Space, Typography } from 'antd';

import ChangePasswordForm from '@/components/features/lecturer/ProfileSetting/ChangePasswordForm';
import PersonalInfoForm from '@/components/features/lecturer/ProfileSetting/PersonalInfoForm';
import { mockLecturers } from '@/data/lecturers';

const { Title, Paragraph } = Typography;

export default function ProfileSettingsPage() {
	return (
		<Space
			direction="vertical"
			style={{ padding: 24, width: '100%' }}
			size="large"
		>
			<div>
				<Title level={2} style={{ marginBottom: 4 }}>
					Profile Settings
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Manage personal information and change the password for the
					administrator account.
				</Paragraph>
			</div>

			<Row gutter={24} align="stretch">
				<Col xs={24} md={14} style={{ display: 'flex' }}>
					<Card title="Personal Information" style={{ flex: 1 }}>
						<PersonalInfoForm lecturer={mockLecturers[0]} />
					</Card>
				</Col>

				<Col xs={24} md={10} style={{ display: 'flex' }}>
					<Card title="Change Password" style={{ flex: 1 }}>
						<ChangePasswordForm />
					</Card>
				</Col>
			</Row>
		</Space>
	);
}

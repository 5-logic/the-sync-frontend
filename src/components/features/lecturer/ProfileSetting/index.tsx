'use client';

import { Card, Col, Row, Typography } from 'antd';

import ChangePasswordForm from '@/components/features/lecturer/ProfileSetting/ChangePasswordForm';
import PersonalInfoForm from '@/components/features/lecturer/ProfileSetting/PersonalInfoForm';
import { mockLecturers } from '@/data/lecturers';

const { Title, Paragraph } = Typography;

export default function ProfileSettingsPage() {
	return (
		<div className="p-6">
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Profile Settings
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 24 }}>
					Manage personal information and change the password for the
					administrator account.
				</Paragraph>
			</div>

			<Row gutter={24} align="stretch">
				<Col xs={24} md={14} style={{ display: 'flex' }}>
					<Card title="Personal Information" style={{ flex: 1, width: '100%' }}>
						<PersonalInfoForm lecturer={mockLecturers[0]} />
					</Card>
				</Col>

				<Col xs={24} md={10} style={{ display: 'flex' }}>
					<Card title="Change Password" style={{ flex: 1, width: '100%' }}>
						<ChangePasswordForm />
					</Card>
				</Col>
			</Row>
		</div>
	);
}

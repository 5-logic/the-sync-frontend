import { Card, Col, Row, Typography } from 'antd';

import ChangePasswordForm from '@/components/features/lecturer/ProfileSetting/ChangePasswordForm';
import PersonalInfoForm from '@/components/features/lecturer/ProfileSetting/PersonalInfoForm';

const { Title, Paragraph } = Typography;

export default function ProfileSettingsPage() {
	return (
		<div className="p-6">
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Profile Settings
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Manage personal information and change the password for the
					administrator account.
				</Paragraph>
			</div>
			<Row gutter={24}>
				<Col xs={24} md={14}>
					<Card title="Personal Information">
						<PersonalInfoForm />
					</Card>
				</Col>
				<Col xs={24} md={10}>
					<Card title="Change Password">
						<ChangePasswordForm />
					</Card>
				</Col>
			</Row>
		</div>
	);
}

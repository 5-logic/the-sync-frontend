'use client';

import { Card, Col, Row, Space, Typography } from 'antd';
import React from 'react';

import StudentAccountForm from '@/components/features/student/AccountSetting/StudentAccountForm';
import StudentChangePasswordForm from '@/components/features/student/AccountSetting/StudentChangePasswordForm';

const { Title, Paragraph } = Typography;

export default function StudentAccountSettingContainer() {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2} style={{ marginBottom: 4 }}>
					Account Settings
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					View and update your personal information, manage your skills, and
					change your password securely.
				</Paragraph>
			</div>
			<Row gutter={[24, 24]}>
				<Col xs={24} md={16}>
					<Card
						style={{
							borderRadius: 12,
							height: '100%',
						}}
						bodyStyle={{ padding: 24 }}
					>
						<StudentAccountForm />
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card
						style={{
							borderRadius: 12,
							height: '100%',
						}}
						bodyStyle={{ padding: 24 }}
					>
						<StudentChangePasswordForm />
					</Card>
				</Col>
			</Row>
		</Space>
	);
}

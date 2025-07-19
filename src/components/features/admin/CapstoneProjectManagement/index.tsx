'use client';

import { Col, Row, Space, Typography } from 'antd';
import React from 'react';

import { Header } from '@/components/common/Header';
import ThesisTable from '@/components/features/admin/CapstoneProjectManagement/ThesisTable';

const { Text } = Typography;
const HomePage = () => {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Row justify="end" style={{ marginBottom: 16 }}>
				<Col>
					<Text type="secondary" style={{ fontSize: '14px' }}>
						Summer 2025 - FPT University Binh Dinh
					</Text>
				</Col>
			</Row>

			<Header
				title="Capstone Project Management"
				description="Capstone Project Management is a platform that updates supervision assignment decisions and facilitates comprehensive tracking and management of capstone project implementation."
			/>
			<ThesisTable />
		</Space>
	);
};

export default HomePage;

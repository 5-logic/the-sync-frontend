'use client';

import { Space } from 'antd';
import React from 'react';

import { Header } from '@/components/common/Header';
import ThesisTable from '@/components/features/admin/CapstoneProjectManagement/GroupTable';

const HomePage = () => {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Capstone Project"
				description="Capstone Project Management is a platform that updates supervision assignment decisions and facilitates comprehensive tracking and management of capstone project implementation."
			/>
			<ThesisTable />
		</Space>
	);
};

export default HomePage;

'use client';

import { Space } from 'antd';
import React from 'react';

import { Header } from '@/components/common/Header';

import ThesisTable from './ThesisTable';

const HomePage = () => {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Capstone Project Management"
				description="Manage supervisor assignments for thesis groups"
				badgeText="Moderator Only"
			/>
			<ThesisTable />
		</Space>
	);
};

export default HomePage;

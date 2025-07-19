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
				description="Capstone Project Management is a platform that updates supervision assignment decisions and facilitates comprehensive tracking and management of capstone project implementation."
				badgeText="Moderator Only"
			/>
			<ThesisTable />
		</Space>
	);
};

export default HomePage;

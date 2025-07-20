'use client';

import { Space } from 'antd';
import React from 'react';

import { Header } from '@/components/common/Header';
import GroupTable from '@/components/features/admin/CapstoneDefenseResults/GroupTable';

const HomePage = () => {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Capstone Defense Results"
				description="View, import, and assess capstone defense results with detailed student info and final evaluation status."
				badgeText="Summer 2025 - FPT University Binh Dinh"
			/>
			<GroupTable />
		</Space>
	);
};

export default HomePage;

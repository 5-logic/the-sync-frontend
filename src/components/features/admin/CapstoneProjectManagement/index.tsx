'use client';

import { Layout, Typography } from 'antd';
import React from 'react';

import ThesisTable from './ThesisTable';

const { Title } = Typography;

const HomePage = () => {
	return (
		<Layout style={{ padding: '24px' }}>
			<Title level={2}>Graduation Thesis Assignment List</Title>
			<ThesisTable />
		</Layout>
	);
};

export default HomePage;

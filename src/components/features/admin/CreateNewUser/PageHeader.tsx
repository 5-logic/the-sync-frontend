'use client';

import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

type PageHeaderProps = {
	title: string;
	subtitle: string;
};

const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
	<div style={{ marginBottom: 32 }}>
		<Title level={2} style={{ marginBottom: 0 }}>
			{title}
		</Title>
		<Paragraph type="secondary" style={{ marginTop: 4 }}>
			{subtitle}
		</Paragraph>
	</div>
);

export default PageHeader;

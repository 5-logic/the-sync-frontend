'use client';

import { Col, Row, Typography } from 'antd';

const { Title, Paragraph } = Typography;

type PageHeaderProps = {
	title: string;
	subtitle: string;
};

const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
	<Row style={{ marginBottom: 32 }}>
		<Col span={24}>
			<Title level={2} style={{ marginBottom: 0 }}>
				{title}
			</Title>
			<Paragraph type="secondary" style={{ marginTop: 4 }}>
				{subtitle}
			</Paragraph>
		</Col>
	</Row>
);

export default PageHeader;

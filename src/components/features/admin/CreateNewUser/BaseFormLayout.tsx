'use client';

import { Card, Col, Layout, Row, Typography } from 'antd';
import { ReactNode, useState } from 'react';

import TabNavigation from '@/components/features/admin/CreateNewUser/TabNavigation';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

type Props = {
	pageTitle: string;
	description: string;
	ManualForm: ReactNode;
	ExcelPlaceholder?: ReactNode;
};

const BaseFormLayout = ({
	pageTitle,
	description,
	ManualForm,
	ExcelPlaceholder,
}: Props) => {
	const [activeTab, setActiveTab] = useState('manual');

	return (
		<Layout style={{ minHeight: '100vh', background: '#fff' }}>
			<Content>
				<Row>
					<Col span={24}>
						<div style={{ width: '100%', maxWidth: '768px' }}>
							<Title level={2} style={{ marginBottom: 0 }}>
								{pageTitle}
							</Title>
							<Paragraph type="secondary" style={{ marginBottom: 16 }}>
								{description}
							</Paragraph>
						</div>

						<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
					</Col>
				</Row>

				<Row style={{ marginTop: 24 }}>
					<Col span={24}>
						<Card>
							{activeTab === 'manual' ? ManualForm : ExcelPlaceholder}
						</Card>
					</Col>
				</Row>
			</Content>
		</Layout>
	);
};

export default BaseFormLayout;

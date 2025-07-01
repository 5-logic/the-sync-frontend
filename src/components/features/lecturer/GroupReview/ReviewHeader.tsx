'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Row, Space, Steps, Typography } from 'antd';

const { Title } = Typography;

interface Props {
	currentStep: number;
	onStepChange: (index: number) => void;
}

export default function ReviewHeader({ currentStep, onStepChange }: Props) {
	const phases = [
		'Submit Thesis',
		'Review 1',
		'Review 2',
		'Review 3',
		'Final Report',
	];

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Row align="middle" justify="space-between">
				<Col>
					<Title level={4} style={{ marginBottom: 10 }}>
						Checklist Review
					</Title>
				</Col>
				<Col>
					<Button type="default" icon={<DownloadOutlined />}>
						Download Template
					</Button>
				</Col>
			</Row>

			<Steps
				current={currentStep}
				size="small"
				items={phases.map((title) => ({ title }))}
				onChange={onStepChange}
			/>
		</Space>
	);
}

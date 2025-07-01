'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Col, Row, Space, Steps, Typography } from 'antd';

const { Title } = Typography;

interface Props {
	currentStep: number;
	onStepChange: (index: number) => void;
}

const phases = [
	'Submit Thesis',
	'Review 1',
	'Review 2',
	'Review 3',
	'Final Report',
];

export default function ReviewHeader({ currentStep, onStepChange }: Props) {
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Row align="middle" justify="space-between">
				<Col>
					<Title level={4} style={{ marginBottom: 15 }}>
						Checklist Review
					</Title>
				</Col>
				<Col>
					<Button
						type="default"
						icon={<DownloadOutlined />}
						htmlType="button"
						onClick={() => {
							console.log('Download template clicked');
						}}
					>
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

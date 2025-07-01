'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, Steps, Typography } from 'antd';

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
		<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div className="flex items-center justify-between">
				<Title level={4} className="!mb-0">
					Checklist Review
				</Title>
				<Button type="default" icon={<DownloadOutlined />}>
					Download Template
				</Button>
			</div>

			<Steps
				current={currentStep}
				size="small"
				items={phases.map((title) => ({ title }))}
				onChange={onStepChange} // ✅ Cho phép click
				className="flex-1"
			/>
			{/* <Button type="default" icon={<DownloadOutlined />}>
				Download Template
			</Button> */}
		</div>
	);
}

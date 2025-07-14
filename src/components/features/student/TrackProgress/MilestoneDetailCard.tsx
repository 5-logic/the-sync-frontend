'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Tag } from 'antd';

const { Panel } = Collapse;

export default function MilestoneDetailCard() {
	return (
		<Card
			className="mb-4"
			title="Milestone 1: Submit Thesis"
			extra={<span>Oct 15, 2023</span>}
		>
			<p>
				<strong>Submitted Files:</strong>
			</p>
			<div className="flex items-center justify-between bg-gray-100 p-2 rounded">
				<span>
					<FileTextOutlined /> proposal_final.pdf
				</span>
				<Button type="primary">Submit</Button>
			</div>
			<div className="mt-3">
				<div className="font-semibold">Supervisor 1</div>
				<div className="text-gray-600">Good</div>
			</div>

			<Collapse className="mt-4">
				<Panel
					header="Milestone 2: Review 1"
					key="1"
					extra={<Tag color="green">Ended</Tag>}
				>
					<p>Due date: Nov 15, 2023</p>
				</Panel>
				<Panel
					header="Milestone 3: Review 2"
					key="2"
					extra={<Tag color="blue">In Progress</Tag>}
				>
					<p>Due date: Dec 15, 2023</p>
				</Panel>
				<Panel
					header="Milestone 4: Review 3"
					key="3"
					extra={<Tag>Upcoming</Tag>}
				>
					<p>Due date: Mar 15, 2024</p>
				</Panel>
				<Panel
					header="Milestone 5: Final Report"
					key="4"
					extra={<Tag>Upcoming</Tag>}
				>
					<p>Due date: May 15, 2024</p>
				</Panel>
			</Collapse>
		</Card>
	);
}

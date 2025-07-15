'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Tag, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

import { Milestone, mockMilestoneDetails } from '@/data/milestone';

const { Panel } = Collapse;
export default function MilestoneDetailCard() {
	const [fileList, setFileList] = useState<
		Record<number, UploadFile<unknown>[]>
	>({});

	const handleUploadChange = (milestoneId: number, info: unknown) => {
		const uploadInfo = info as { fileList: UploadFile<unknown>[] };
		const newFileList = { ...fileList, [milestoneId]: uploadInfo.fileList };
		setFileList(newFileList);
	};

	return (
		<Card
			className="mb-4"
			title={`Milestone 1: ${mockMilestoneDetails[0].title}`}
			extra={<span>{mockMilestoneDetails[0].date}</span>}
		>
			<p>
				<strong>Submitted Files:</strong>
			</p>
			<div className="flex items-center justify-between bg-gray-100 p-2 rounded">
				<span>
					<FileTextOutlined /> {mockMilestoneDetails[0].fileName}
				</span>
				<Button type="primary">Submit</Button>
			</div>

			{mockMilestoneDetails[0].feedback && (
				<div className="mt-3">
					<div className="font-semibold">
						{mockMilestoneDetails[0].supervisor}
					</div>
					<div className="text-gray-600">
						{mockMilestoneDetails[0].feedback}
					</div>
				</div>
			)}

			<Collapse className="mt-4">
				{mockMilestoneDetails.slice(1).map((milestone: Milestone) => (
					<Panel
						header={`Milestone ${milestone.id}: ${milestone.title}`}
						key={milestone.id}
						extra={
							<Tag
								color={
									milestone.status === 'Ended'
										? 'green'
										: milestone.status === 'In Progress'
											? 'blue'
											: 'default'
								}
							>
								{milestone.status}
							</Tag>
						}
					>
						<p>Due date: {milestone.date}</p>
						<Upload
							fileList={fileList[milestone.id] || []}
							beforeUpload={() => false}
							onChange={(info) => handleUploadChange(milestone.id, info)}
						>
							<Button icon={<UploadOutlined />}>Choose File</Button>
						</Upload>
						<Button type="primary" className="mt-2">
							Submit
						</Button>

						{milestone.feedback && (
							<div className="mt-3">
								<div className="font-semibold">{milestone.supervisor}</div>
								<div className="text-gray-600">{milestone.feedback}</div>
							</div>
						)}
					</Panel>
				))}
			</Collapse>
		</Card>
	);
}

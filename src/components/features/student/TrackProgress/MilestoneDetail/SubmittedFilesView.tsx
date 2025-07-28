'use client';

import {
	CheckCircleTwoTone,
	FileTextOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Flex, Space, Typography } from 'antd';

import { StorageService } from '@/lib/services/storage.service';

interface SubmittedFilesViewProps {
	readonly documents: string[];
	readonly canSubmit: boolean;
	readonly onUpdateMode: () => void;
}

export function SubmittedFilesView({
	documents,
	canSubmit,
	onUpdateMode,
}: SubmittedFilesViewProps) {
	return (
		<Space direction="vertical" size={12} style={{ width: '100%' }}>
			<Flex
				justify="space-between"
				align="center"
				style={{
					backgroundColor: '#f5f5f5',
					border: '1px solid #cec7c7ff',
					padding: 12,
					borderRadius: 8,
				}}
			>
				<Flex align="center" gap={8}>
					<FileTextOutlined />
					<Typography.Text>Submitted files</Typography.Text>
				</Flex>
				<CheckCircleTwoTone twoToneColor="#52c41a" />
			</Flex>

			{/* Display submitted files */}
			{documents.map((url: string) => (
				<div
					key={url}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '12px 16px',
						border: '1px solid #d9d9d9',
						borderRadius: 8,
						backgroundColor: '#fff',
						marginBottom: 8,
						gap: 8,
						minWidth: 0,
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							minWidth: 0,
							flex: 1,
						}}
					>
						<FileTextOutlined style={{ color: '#52c41a', flexShrink: 0 }} />
						<div style={{ minWidth: 0, flex: 1 }}>
							<div
								style={{
									fontWeight: 500,
									wordBreak: 'break-all',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									maxWidth: '100%',
								}}
								title={StorageService.getFileNameFromUrl(url)}
							>
								{StorageService.getFileNameFromUrl(url)}
							</div>
							<div style={{ color: '#666', fontSize: 13 }}>Submitted file</div>
						</div>
					</div>
					<Button
						type="link"
						onClick={() => window.open(url, '_blank')}
						style={{ flexShrink: 0 }}
					>
						Download
					</Button>
				</div>
			))}

			{/* Option to update submission if allowed */}
			{canSubmit && (
				<Button type="default" onClick={onUpdateMode} style={{ marginTop: 12 }}>
					Update Submission
				</Button>
			)}

			{/* Feedback section - will be implemented when API is ready */}
			<Flex
				align="flex-start"
				gap={12}
				style={{
					backgroundColor: '#fafafa',
					border: '1px solid #f0f0f0',
					padding: 12,
					marginTop: 12,
					borderRadius: 8,
				}}
			>
				<Avatar icon={<UserOutlined />} />
				<Space direction="vertical" size={4}>
					<Typography.Text strong>Reviewer</Typography.Text>
					<Typography.Paragraph style={{ margin: 0 }}>
						Feedback will be displayed here
					</Typography.Paragraph>
				</Space>
			</Flex>
		</Space>
	);
}

'use client';

import { DisconnectOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Space, Tooltip } from 'antd';

import { GroupDashboard } from '@/schemas/group';

interface Props {
	readonly group: GroupDashboard;
	readonly onViewDetail?: () => void;
	readonly onUnassignThesis?: () => void;
}

export default function ThesisCard({
	group,
	onViewDetail,
	onUnassignThesis,
}: Props) {
	const { thesis } = group;

	if (!thesis) {
		return (
			<Card
				title="Group's Thesis"
				size="small"
				headStyle={{
					fontSize: '16px',
					fontWeight: '600',
					paddingLeft: '20px',
					paddingRight: '20px',
				}}
			>
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description="This group has no thesis yet."
					style={{ margin: 0 }}
				/>
			</Card>
		);
	}

	return (
		<Card
			title="Group's Thesis"
			size="small"
			headStyle={{
				fontSize: '16px',
				fontWeight: '600',
				paddingLeft: '20px',
				paddingRight: '20px',
			}}
			extra={
				<Space>
					<Tooltip title="View Thesis Details">
						<Button
							type="text"
							icon={<EyeOutlined />}
							size="small"
							onClick={onViewDetail}
						/>
					</Tooltip>
					<Tooltip title="Unassign Thesis">
						<Button
							type="text"
							icon={<DisconnectOutlined />}
							size="small"
							onClick={onUnassignThesis}
							danger
						/>
					</Tooltip>
				</Space>
			}
		>
			<div className="space-y-3">
				<div>
					<div className="text-sm text-gray-500 mb-1">English Name</div>
					<div className="font-medium">{thesis.englishName}</div>
				</div>

				<div>
					<div className="text-sm text-gray-500 mb-1">Abbreviation</div>
					<div className="font-medium">{thesis.abbreviation}</div>
				</div>

				<div>
					<div className="text-sm text-gray-500 mb-1">Domain</div>
					<div className="font-medium">{thesis.domain}</div>
				</div>

				{thesis.description && (
					<div>
						<div className="text-sm text-gray-500 mb-1">Description</div>
						<div className="text-sm text-gray-600 leading-relaxed">
							{thesis.description.length > 150
								? `${thesis.description.substring(0, 150)}...`
								: thesis.description}
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}

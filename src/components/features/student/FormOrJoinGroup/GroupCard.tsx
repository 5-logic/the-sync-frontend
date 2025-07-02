import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Grid, Space, Tag, Typography } from 'antd';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const domainColorMap: Record<string, string> = {
	AI: 'geekblue',
	'Artificial Intelligence': 'geekblue',
	Blockchain: 'cyan',
	'Internet of Things': 'gold',
	'Data Analytics': 'purple',
	'Cloud Computing': 'volcano',
	'App Development': 'blue',
	'Web Development': 'blue',
	IoT: 'gold',
	Cybersecurity: 'red',
	'Data Science': 'purple',
	'Mobile Development': 'green',
};

type GroupUI = {
	id: string;
	name: string;
	description: string;
	domain: string;
	members: number;
};

export default function GroupCard({
	group,
	fontSize,
}: {
	group: GroupUI;
	fontSize: number;
}) {
	const screens = useBreakpoint();

	return (
		<Card
			style={{
				borderRadius: 12,
				width: '100%',
				minHeight: 280,
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
			bodyStyle={{
				padding: screens.xs ? 16 : 24,
				display: 'flex',
				flexDirection: 'column',
				flex: 1,
				justifyContent: 'space-between',
			}}
		>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				<div style={{ flex: 1 }}>
					<div
						style={{
							margin: 0,
							marginBottom: 8,
							fontSize: fontSize + 2,
							fontWeight: 600,
							lineHeight: 1.3,
							overflow: 'hidden',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							textOverflow: 'ellipsis',
							wordBreak: 'break-word',
							minHeight: `${(fontSize + 2) * 1.3 * 2}px`,
							maxHeight: `${(fontSize + 2) * 1.3 * 2}px`,
							whiteSpace: 'normal',
							color: 'rgba(0, 0, 0, 0.88)',
						}}
						title={group.name}
					>
						{group.name}
					</div>
					<Tag
						color={domainColorMap[group.domain] || 'default'}
						style={{ fontSize: fontSize - 3, marginBottom: 8 }}
					>
						{group.domain}
					</Tag>
					<div
						style={{
							fontSize,
							lineHeight: 1.4,
							overflow: 'hidden',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							textOverflow: 'ellipsis',
							wordBreak: 'break-word',
							minHeight: `${fontSize * 1.4 * 2}px`,
							maxHeight: `${fontSize * 1.4 * 2}px`,
							whiteSpace: 'normal',
							color: 'rgba(0, 0, 0, 0.45)',
						}}
						title={group.description}
					>
						{group.description}
					</div>
					<Space align="center" style={{ marginTop: 8 }}>
						<UserOutlined
							style={{ fontSize: fontSize - 1, color: '#bfbfbf' }}
						/>
						<Text
							type="secondary"
							style={{ fontSize: fontSize - 2, marginLeft: 4 }}
						>
							{group.members} members
						</Text>
					</Space>
				</div>
				<div
					style={{
						marginTop: 16,
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
					}}
				>
					<div
						style={{
							display: 'flex',
							gap: 8,
							flexWrap: 'wrap',
						}}
					>
						<Button
							style={{
								borderRadius: 6,
								border: '1px solid #222',
								fontWeight: 500,
								fontSize: Math.min(fontSize - 1, 12),
								height: 40,
								lineHeight: '18px',
								padding: '0 12px',
								flex: '1 1 0',
								minWidth: '120px',
							}}
							title="View Group Detail"
						>
							View Group Detail
						</Button>
						<Button
							type="primary"
							style={{
								borderRadius: 6,
								fontWeight: 500,
								fontSize: Math.min(fontSize - 1, 12),
								height: 40,
								lineHeight: '18px',
								padding: '0 12px',
								flex: '1 1 0',
								minWidth: '120px',
							}}
							title="Request to Join"
						>
							Request to Join
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}

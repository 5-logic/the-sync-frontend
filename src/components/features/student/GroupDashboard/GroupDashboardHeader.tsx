import { UserAddOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function GroupDashboardHeader() {
	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<Title
					level={2}
					className="text-xl md:text-2xl font-bold text-gray-700 mb-0"
				>
					Group Dashboard
				</Title>
				<Paragraph className="text-gray-500 mb-0 mt-1">
					View your group information, members, and thesis progress
				</Paragraph>
			</div>
			<Button
				icon={<UserAddOutlined />}
				style={{
					borderRadius: 6,
					height: 32,
					fontSize: 14,
					padding: '4px 15px',
					whiteSpace: 'nowrap',
					border: '1px solid #d9d9d9',
					backgroundColor: '#fff',
					color: 'rgba(0, 0, 0, 0.88)',
					fontWeight: 400,
				}}
			>
				Request Invite/Join Group
			</Button>
		</div>
	);
}

import { UserAddOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import RequestsButton from '@/components/features/student/GroupDashboard/RequestsButton';
import { GroupDashboard } from '@/schemas/group';

const { Title, Paragraph } = Typography;

interface GroupDashboardHeaderProps {
	readonly group: GroupDashboard;
}

export default function GroupDashboardHeader({
	group,
}: GroupDashboardHeaderProps) {
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
			<RequestsButton group={group}>
				<UserAddOutlined />
				Request Invite/Join Group
			</RequestsButton>
		</div>
	);
}

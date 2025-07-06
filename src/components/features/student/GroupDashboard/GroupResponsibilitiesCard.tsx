import { Card, Tag, Typography } from 'antd';

import { GroupDashboard } from '@/schemas/group';

const { Text } = Typography;

interface GroupResponsibilitiesCardProps {
	group: GroupDashboard;
}

export default function GroupResponsibilitiesCard({
	group,
}: GroupResponsibilitiesCardProps) {
	return (
		<Card title="Expected Responsibilities" size="small">
			{group.responsibilities.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{group.responsibilities.map((responsibility) => (
						<Tag key={responsibility.id} color="green">
							{responsibility.name}
						</Tag>
					))}
				</div>
			) : (
				<Text type="secondary">No responsibilities specified</Text>
			)}
		</Card>
	);
}

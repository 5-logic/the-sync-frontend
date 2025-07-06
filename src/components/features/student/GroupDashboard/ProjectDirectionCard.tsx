import { Card, Typography } from 'antd';

import { GroupDashboard } from '@/schemas/group';

const { Paragraph } = Typography;

interface ProjectDirectionCardProps {
	group: GroupDashboard;
}

export default function ProjectDirectionCard({
	group,
}: ProjectDirectionCardProps) {
	return (
		<Card title="Project Direction" size="small">
			<Paragraph>
				{group.projectDirection || 'No project direction specified'}
			</Paragraph>
		</Card>
	);
}

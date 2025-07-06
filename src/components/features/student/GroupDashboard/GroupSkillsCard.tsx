import { Card, Tag, Typography } from 'antd';

import { GroupDashboard } from '@/schemas/group';

const { Text } = Typography;

interface GroupSkillsCardProps {
	group: GroupDashboard;
}

export default function GroupSkillsCard({ group }: GroupSkillsCardProps) {
	return (
		<Card title="Required Skills" size="small">
			{group.skills.length > 0 ? (
				<div className="space-y-2">
					{group.skills.map((skill) => (
						<div key={skill.id}>
							<Tag color="blue">{skill.skillSet.name}</Tag>
							<Text className="ml-2">{skill.name}</Text>
						</div>
					))}
				</div>
			) : (
				<Text type="secondary">No skills specified</Text>
			)}
		</Card>
	);
}

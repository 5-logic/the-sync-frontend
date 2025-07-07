import { Button, Card, Divider, Tag, Typography } from 'antd';

import GroupMembersCard from '@/components/features/student/GroupDashboard/GroupMembersCard';
import { formatDate } from '@/lib/utils/dateFormat';
import { GroupDashboard } from '@/schemas/group';

const { Title, Text } = Typography;

interface GroupInfoCardProps {
	readonly group: GroupDashboard;
}

export default function GroupInfoCard({ group }: GroupInfoCardProps) {
	return (
		<Card className="bg-white border border-gray-200 rounded-md">
			<div className="pb-4">
				<Title level={4} className="text-base font-bold text-gray-600 mb-3">
					Group Information
				</Title>
				<Divider className="bg-gray-100 my-3" size="small" />
			</div>

			<div className="space-y-4">
				{/* Group Details */}
				<div className="space-y-4">
					{/* Basic Group Info */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Group Name
							</Text>
							<Text className="text-sm text-gray-600">{group.name}</Text>
						</div>
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Group Code
							</Text>
							<Text className="text-sm text-gray-600">{group.code}</Text>
						</div>
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Semester
							</Text>
							<Text className="text-sm text-gray-600">
								{group.semester.name}
							</Text>
						</div>
					</div>

					{/* Project Direction */}
					{group.projectDirection && (
						<div>
							<Text className="text-sm text-gray-400 block font-semibold">
								Project Direction
							</Text>
							<Text className="text-sm text-gray-600">
								{group.projectDirection}
							</Text>
						</div>
					)}

					{/* Skills and Responsibilities - 2 columns */}
					{((group.skills && group.skills.length > 0) ||
						(group.responsibilities && group.responsibilities.length > 0)) && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Required Skills */}
							{group.skills && group.skills.length > 0 && (
								<div>
									<Text className="text-sm text-gray-400 block font-semibold">
										Required Skills
									</Text>
									<div className="flex flex-wrap gap-2 mt-1">
										{group.skills.map((skill) => (
											<Tag key={skill.id} color="blue" className="text-xs">
												{skill.name}
											</Tag>
										))}
									</div>
								</div>
							)}

							{/* Responsibilities */}
							{group.responsibilities && group.responsibilities.length > 0 && (
								<div>
									<Text className="text-sm text-gray-400 block font-semibold">
										Responsibilities
									</Text>
									<div className="flex flex-wrap gap-2 mt-1">
										{group.responsibilities.map((responsibility) => (
											<Tag
												key={responsibility.id}
												color="green"
												className="text-xs"
											>
												{responsibility.name}
											</Tag>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Members Section */}
					<div>
						<Text className="text-sm text-gray-400 block font-semibold">
							Members
						</Text>
					</div>
				</div>

				{/* Members Card */}
				<GroupMembersCard group={group} />

				{/* Created Date and Invite Button */}
				<div className="flex items-end justify-between pt-4">
					<div>
						<Text className="text-sm text-gray-400 block font-semibold">
							Created Date
						</Text>
						<Text className="text-sm text-gray-600">
							{formatDate(group.createdAt)}
						</Text>
					</div>
					<Button type="primary">Invite Members</Button>
				</div>
			</div>
		</Card>
	);
}

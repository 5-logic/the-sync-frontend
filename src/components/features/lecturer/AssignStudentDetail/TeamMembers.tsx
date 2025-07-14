'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, List, Typography } from 'antd';

import { GroupDashboard } from '@/schemas/group';

const { Title } = Typography;

interface TeamMembersProps {
	readonly group: GroupDashboard;
}

export default function TeamMembers({ group }: TeamMembersProps) {
	return (
		<List
			header={<Title level={5}>Team Members ({group.members.length})</Title>}
			dataSource={group.members}
			renderItem={(member) => (
				<List.Item>
					<List.Item.Meta
						avatar={<Avatar icon={<UserOutlined />} />}
						title={
							<div className="flex items-center space-x-2">
								<span>{member.user.fullName}</span>
								{member.isLeader && (
									<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
										Leader
									</span>
								)}
							</div>
						}
						description={
							<div>
								<div>
									{member.studentCode} • {member.user.email}
								</div>
								<div className="text-sm text-gray-500">{member.major.name}</div>
							</div>
						}
					/>
				</List.Item>
			)}
		/>
	);
}

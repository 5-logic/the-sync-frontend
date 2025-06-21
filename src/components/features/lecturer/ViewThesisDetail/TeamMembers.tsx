import { Space, Tag, Typography } from 'antd';
import Image from 'next/image';

import { ExtendedThesis } from '@/data/thesis';

const { Text, Paragraph } = Typography;

interface Props {
	thesis: ExtendedThesis;
}

export default function TeamMembers({ thesis }: Props) {
	if (!thesis.group) return null;

	return (
		<div style={{ marginBottom: 24 }}>
			<Text strong>Team Members ({thesis.group.members.length}/4)</Text>
			<div style={{ marginTop: 12 }}>
				{thesis.group.members.map((member) => (
					<Space
						key={member.email}
						style={{
							display: 'flex',
							alignItems: 'center',
							padding: '12px 0',
							borderBottom: '1px solid #f0f0f0',
						}}
					>
						<Image
							src="/images/user_avatar.png"
							alt={member.name}
							width={40}
							height={40}
							style={{ borderRadius: '50%' }}
						/>
						<div style={{ flex: 1 }}>
							<Text strong>{member.name}</Text>
							{member.isLeader && (
								<Tag color="red" style={{ marginLeft: 8 }}>
									Leader
								</Tag>
							)}
							<Paragraph style={{ margin: 0 }} type="secondary">
								{member.email}
							</Paragraph>
						</div>
					</Space>
				))}
			</div>
		</div>
	);
}

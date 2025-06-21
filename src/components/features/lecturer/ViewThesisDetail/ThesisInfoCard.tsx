import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import Image from 'next/image';

import RejectReasonList from '@/components/features/lecturer/ViewThesisDetail/RejectReasonList';
import TeamMembers from '@/components/features/lecturer/ViewThesisDetail/TeamMembers';
import { ExtendedThesis } from '@/data/thesis';

const { Title, Text, Paragraph } = Typography;

type Props = {
	readonly thesis: ExtendedThesis;
};

function getStatusColor(status: string): string {
	switch (status) {
		case 'Approved':
			return 'green';
		case 'Pending':
			return 'orange';
		case 'Rejected':
			return 'red';
		default:
			return 'default';
	}
}

export default function ThesisInfoCard({ thesis }: Props) {
	return (
		<Card>
			<Title level={4}>{thesis.englishName}</Title>
			<Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
				<Tag color="blue">{thesis.domain}</Tag>
				<Tag color={getStatusColor(thesis.status)}>{thesis.status}</Tag>
				<Tag color="gold">Version {thesis.version}</Tag>
			</Space>

			<Row gutter={32} style={{ marginBottom: 16 }}>
				<Col span={12}>
					<Text strong>Vietnamese name</Text>
					<Paragraph>{thesis.vietnameseName}</Paragraph>
				</Col>
				<Col span={12}>
					<Text strong>Abbreviation</Text>
					<Paragraph>{thesis.abbreviation}</Paragraph>
				</Col>
			</Row>

			<div style={{ marginBottom: 16 }}>
				<Text strong>Description</Text>
				<Paragraph>{thesis.description}</Paragraph>
			</div>

			<div style={{ marginBottom: 16 }}>
				<Text strong>Required Skills</Text>
				<div style={{ marginTop: 8 }}>
					{thesis.skills.map((skill) => (
						<Tag key={skill}>{skill}</Tag>
					))}
				</div>
			</div>

			<Button icon={<DownloadOutlined />} style={{ marginBottom: 24 }}>
				Download Supporting Document
			</Button>

			<div style={{ marginBottom: 24 }}>
				<Text strong>Supervisor Information</Text>
				<div style={{ marginTop: 8 }}>
					<Space>
						<Image
							src="/images/user_avatar.png"
							alt="Supervisor Avatar"
							width={48}
							height={48}
							style={{ borderRadius: '50%' }}
						/>
						<div>
							<Text strong>{thesis.supervisor?.name}</Text>
							<Paragraph style={{ marginBottom: 0 }}>
								{thesis.supervisor?.phone}
							</Paragraph>
							<Paragraph style={{ marginBottom: 0 }} type="secondary">
								{thesis.supervisor?.email}
							</Paragraph>
						</div>
					</Space>
				</div>
			</div>

			<TeamMembers thesis={thesis} />
			<RejectReasonList
				reasons={thesis.rejectReasons}
				show={thesis.status === 'Rejected'}
			/>
		</Card>
	);
}

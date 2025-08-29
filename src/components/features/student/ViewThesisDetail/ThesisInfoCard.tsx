'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Divider, Space, Typography } from 'antd';

import BaseThesisInfoCard, {
	type BaseThesisInfo,
	type SupervisorInfo,
} from '@/components/common/BaseThesisInfoCard';
import { Lecturer } from '@/schemas/lecturer';
import { ThesisWithRelations } from '@/schemas/thesis';

const { Text, Paragraph } = Typography;

interface SupervisorDetails {
	id: string;
	fullName: string;
	email: string;
}

interface EnhancedThesis extends ThesisWithRelations {
	lecturerInfo?: Lecturer;
	supervisors?: SupervisorDetails[];
}

interface Props {
	readonly thesis: EnhancedThesis;
}

export default function ThesisInfoCard({ thesis }: Props) {
	// Transform ThesisWithRelations to BaseThesisInfo
	const baseThesis: BaseThesisInfo = {
		englishName: thesis.englishName,
		vietnameseName: thesis.vietnameseName,
		abbreviation: thesis.abbreviation,
		description: thesis.description,
		domain: thesis.domain,
		orientation: thesis.orientation,
		status: thesis.status,
		semesterId: thesis.semesterId,
		thesisVersions: thesis.thesisVersions,
	};

	// Use lecturerInfo to create supervisor info
	const supervisor: SupervisorInfo | undefined = thesis.lecturerInfo
		? {
				name: thesis.lecturerInfo.fullName,
				email: thesis.lecturerInfo.email,
				phone: thesis.lecturerInfo.phoneNumber || '',
			}
		: undefined;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Main thesis information */}
			<BaseThesisInfoCard thesis={baseThesis} supervisor={supervisor} />

			{/* Supervisors section */}
			{thesis.supervisors && thesis.supervisors.length > 0 && (
				<Card title="Assigned Supervisors">
					<Space direction="vertical" size="middle" style={{ width: '100%' }}>
						{thesis.supervisors.map((supervisor, index) => (
							<div key={supervisor.id}>
								<Space size={16}>
									<Avatar size={48} icon={<UserOutlined />} />
									<div>
										<Text strong>{supervisor.fullName}</Text>
										<Paragraph style={{ marginBottom: 0 }}>
											{supervisor.email}
										</Paragraph>
									</div>
								</Space>
								{index < (thesis.supervisors?.length || 0) - 1 && (
									<Divider style={{ marginTop: 16, marginBottom: 0 }} />
								)}
							</div>
						))}
					</Space>
				</Card>
			)}
		</Space>
	);
}

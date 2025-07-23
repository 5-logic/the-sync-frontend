import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Col,
	Divider,
	Row,
	Space,
	Tag,
	Typography,
} from 'antd';

import { StorageService } from '@/lib/services/storage.service';
import { showNotification } from '@/lib/utils/notification';

const { Title, Text, Paragraph } = Typography;

// Base type for thesis info display
export interface BaseThesisInfo {
	englishName: string;
	vietnameseName: string;
	abbreviation: string;
	description: string;
	domain?: string | null;
	status: 'New' | 'Pending' | 'Approved' | 'Rejected';
	thesisRequiredSkills?: Array<{
		thesisId: string;
		skillId: string;
		skill: { id: string; name: string };
	}>;
	thesisVersions?: Array<{
		id: string;
		version: number;
		supportingDocument: string;
	}>;
}

// Supervisor info type
export interface SupervisorInfo {
	name: string;
	email: string;
	phone: string;
}

interface Props {
	readonly thesis: BaseThesisInfo;
	readonly supervisor?: SupervisorInfo;
}

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

export default function BaseThesisInfoCard({ thesis, supervisor }: Props) {
	// Helper function to handle empty values consistently
	const getDisplayValue = (
		value: string | undefined,
		fallback: string,
	): string => {
		return (value ?? '') === '' ? fallback : value!;
	};

	const handleDownloadSupportingDocument = async () => {
		try {
			// Get the latest version's supporting document
			const latestVersion = thesis.thesisVersions?.[0];
			const supportingDocumentUrl = latestVersion?.supportingDocument;

			if (!supportingDocumentUrl) {
				showNotification.error(
					'Download Failed',
					'No supporting document available for download',
				);
				return;
			}

			// Get download URL from storage service
			const downloadUrl = await StorageService.getDownloadUrl(
				supportingDocumentUrl,
			);

			// Open download in new tab
			window.open(downloadUrl, '_blank');

			showNotification.success(
				'Download Started',
				'Supporting document download has started',
			);
		} catch {
			showNotification.error(
				'Download Failed',
				'Could not download supporting document',
			);
		}
	};

	return (
		<Card>
			<Title level={4}>{thesis.englishName}</Title>
			<Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
				<Tag color="blue">{thesis.domain}</Tag>
				<Tag color={getStatusColor(thesis.status)}>{thesis.status}</Tag>
				<Tag color="gold">
					Version {thesis.thesisVersions?.[0]?.version || '1.0'}
				</Tag>
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

			<div style={{ marginBottom: 24 }}>
				<Title level={5} style={{ marginBottom: 8 }}>
					Required Skills
				</Title>
				<Space wrap size={[8, 12]}>
					{thesis.thesisRequiredSkills?.length ? (
						thesis.thesisRequiredSkills
							.filter((trs) => trs.skill) // Filter out undefined skills
							.map((trs) => <Tag key={trs.skill.id}>{trs.skill.name}</Tag>)
					) : (
						<Text type="secondary">No skills specified</Text>
					)}
				</Space>
			</div>

			<Button
				icon={<DownloadOutlined />}
				style={{ marginBottom: 24 }}
				onClick={handleDownloadSupportingDocument}
				disabled={!thesis.thesisVersions?.length}
			>
				Download Supporting Document
			</Button>

			<Divider size="small" />

			{supervisor && (
				<div style={{ marginBottom: 24 }}>
					<Title level={5} style={{ marginBottom: 12 }}>
						Supervisor Information
					</Title>
					<Space size={16}>
						<Avatar size={48} icon={<UserOutlined />} />
						<div>
							<Text strong>
								{getDisplayValue(supervisor.name, 'Unknown Supervisor')}
							</Text>
							<Paragraph style={{ marginBottom: 0 }}>
								{getDisplayValue(supervisor.email, 'No email provided')}
							</Paragraph>
							<Paragraph style={{ marginBottom: 0 }} type="secondary">
								{getDisplayValue(supervisor.phone, 'No phone provided')}
							</Paragraph>
						</div>
					</Space>
				</div>
			)}
		</Card>
	);
}

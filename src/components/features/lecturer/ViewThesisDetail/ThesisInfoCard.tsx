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

import TeamMembers from '@/components/features/lecturer/ViewThesisDetail/TeamMembers';
import { ExtendedThesis } from '@/data/thesis';
import { StorageService } from '@/lib/services/storage.service';
import { showNotification } from '@/lib/utils/notification';

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
	const handleDownloadSupportingDocument = async () => {
		try {
			// Get the latest version's supporting document (backend already sorts by version desc)
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

			<div style={{ marginBottom: 24 }}>
				<Title level={5} style={{ marginBottom: 8 }}>
					Required Skills
				</Title>
				<Space wrap size={[8, 12]}>
					{thesis.skills.map((skill) => (
						<Tag key={skill}>{skill}</Tag>
					))}
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

			<div style={{ marginBottom: 24 }}>
				<Title level={5} style={{ marginBottom: 12 }}>
					Supervisor Information
				</Title>
				<Space size={16}>
					<Avatar size={48} icon={<UserOutlined />} />
					<div>
						<Text strong>
							{thesis.supervisor?.name || 'Unknown Supervisor'}
						</Text>
						<Paragraph style={{ marginBottom: 0 }}>
							{thesis.supervisor?.phone || 'No phone provided'}
						</Paragraph>
						<Paragraph style={{ marginBottom: 0 }} type="secondary">
							{thesis.supervisor?.email || 'No email provided'}
						</Paragraph>
					</div>
				</Space>
			</div>

			<TeamMembers thesis={thesis} />
		</Card>
	);
}

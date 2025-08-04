import {
	DownloadOutlined,
	HistoryOutlined,
	UserOutlined,
} from "@ant-design/icons";
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
} from "antd";
import { useEffect, useState } from "react";

import ThesisDocumentVersionDialog from "@/components/common/ThesisDocumentVersionDialog";

import { StorageService } from "@/lib/services/storage.service";
import { showNotification } from "@/lib/utils/notification";
import { useSemesterStore } from "@/store";

const { Title, Text, Paragraph } = Typography;

// Base type for thesis info display
export interface BaseThesisInfo {
	englishName: string;
	vietnameseName: string;
	abbreviation: string;
	description: string;
	domain?: string | null;
	status: "New" | "Pending" | "Approved" | "Rejected";
	semesterId?: string;
	thesisRequiredSkills?: Array<{
		id: string;
		name: string;
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
		case "Approved":
			return "green";
		case "Pending":
			return "orange";
		case "Rejected":
			return "red";
		default:
			return "default";
	}
}

export default function BaseThesisInfoCard({ thesis, supervisor }: Props) {
	const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
	const { getSemesterById, fetchSemesters } = useSemesterStore();

	// Fetch semesters when component mounts
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Helper function to handle empty values consistently
	const getDisplayValue = (
		value: string | undefined,
		fallback: string,
	): string => {
		return (value ?? "") === "" ? fallback : value!;
	};

	const handleDownloadSupportingDocument = async () => {
		try {
			// Get the latest version's supporting document
			const latestVersion = thesis.thesisVersions?.[0];
			const supportingDocumentUrl = latestVersion?.supportingDocument;

			if (!supportingDocumentUrl) {
				showNotification.error(
					"Download Failed",
					"No supporting document available for download",
				);
				return;
			}

			// Get download URL from storage service
			const downloadUrl = await StorageService.getDownloadUrl(
				supportingDocumentUrl,
			);

			// Open download in new tab
			window.open(downloadUrl, "_blank");

			showNotification.success(
				"Download Started",
				"Supporting document download has started",
			);
		} catch {
			showNotification.error(
				"Download Failed",
				"Could not download supporting document",
			);
		}
	};

	return (
		<Card>
			<Title level={4}>{thesis.englishName}</Title>
			<Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
				{thesis.domain && <Tag color="blue">{thesis.domain}</Tag>}
				{thesis.semesterId && (
					<Tag color="purple">
						{getSemesterById(thesis.semesterId)?.name || "Unknown Semester"}
					</Tag>
				)}
				<Tag color={getStatusColor(thesis.status)}>{thesis.status}</Tag>
				<Tag color="gold">
					Version {thesis.thesisVersions?.[0]?.version || "1.0"}
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
						thesis.thesisRequiredSkills.map((skill) => (
							<Tag key={skill.id}>{skill.name}</Tag>
						))
					) : (
						<Text type="secondary">No skills specified</Text>
					)}
				</Space>
			</div>

			<Space size={16} style={{ marginBottom: 24 }}>
				<Button
					icon={<DownloadOutlined />}
					onClick={handleDownloadSupportingDocument}
					disabled={!thesis.thesisVersions?.length}
				>
					Download Supporting Document
				</Button>
				<Button
					icon={<HistoryOutlined />}
					onClick={() => setIsVersionDialogOpen(true)}
					disabled={
						!thesis.thesisVersions?.length || thesis.thesisVersions.length === 0
					}
				>
					Thesis&apos;s Document Versions
				</Button>
			</Space>

			<Divider size="small" />

			{supervisor && (
				<div style={{ marginBottom: 24 }}>
					<Title level={5} style={{ marginBottom: 12 }}>
						Lecturer Creator Information
					</Title>
					<Space size={16}>
						<Avatar size={48} icon={<UserOutlined />} />
						<div>
							<Text strong>
								{getDisplayValue(supervisor.name, "Unknown Lecturer Creator")}
							</Text>
							<Paragraph style={{ marginBottom: 0 }}>
								{getDisplayValue(supervisor.email, "No email provided")}
							</Paragraph>
							<Paragraph style={{ marginBottom: 0 }} type="secondary">
								{getDisplayValue(supervisor.phone, "No phone provided")}
							</Paragraph>
						</div>
					</Space>
				</div>
			)}

			{/* Thesis Document Version Dialog */}
			<ThesisDocumentVersionDialog
				open={isVersionDialogOpen}
				onCancel={() => setIsVersionDialogOpen(false)}
				thesisVersions={thesis.thesisVersions || []}
				thesisTitle={thesis.englishName}
			/>
		</Card>
	);
}

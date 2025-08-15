"use client";

import { Modal, Typography, Space, Tag, Divider } from "antd";
import { ThesisApplication } from "@/lib/services/thesis-application.service";

const { Title, Text, Paragraph } = Typography;

interface Props {
	thesis: ThesisApplication["thesis"] | null;
	open: boolean;
	onClose: () => void;
}

export default function ThesisDetailModal({
	thesis,
	open,
	onClose,
}: Readonly<Props>) {
	if (!thesis) return null;

	return (
		<Modal
			title="Thesis Details"
			open={open}
			onCancel={onClose}
			footer={null}
			width={800}
			destroyOnClose
		>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				{/* English Name */}
				<div>
					<Title level={4} style={{ marginBottom: 8 }}>
						English Title
					</Title>
					<Text strong style={{ fontSize: 16 }}>
						{thesis.englishName}
					</Text>
				</div>

				{/* Vietnamese Name */}
				<div>
					<Title level={4} style={{ marginBottom: 8 }}>
						Vietnamese Title
					</Title>
					<Text style={{ fontSize: 16 }}>{thesis.vietnameseName}</Text>
				</div>

				<Divider size="small" />

				{/* Description */}
				<div>
					<Title level={4} style={{ marginBottom: 8 }}>
						Description
					</Title>
					<Paragraph style={{ textAlign: "justify" }}>
						{thesis.description}
					</Paragraph>
				</div>

				{/* Domain */}
				<div>
					<Title level={4} style={{ marginBottom: 8 }}>
						Domain
					</Title>
					<Paragraph style={{ textAlign: "justify" }}>
						{thesis.domain}
					</Paragraph>
				</div>

				<Divider size="small" />

				{/* Thesis Details */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div>
						<Text type="secondary">Abbreviation: </Text>
						<Tag color="blue">{thesis.abbreviation}</Tag>
					</div>
					<div>
						<Text type="secondary">Status: </Text>
						<Tag color={thesis.isPublish ? "green" : "orange"}>
							{thesis.isPublish ? "Published" : "Draft"}
						</Tag>
					</div>
				</div>

				{/* Lecturer Info */}
				<div>
					<Title level={4} style={{ marginBottom: 8 }}>
						Supervisor
					</Title>
					<div>
						<Text strong>{thesis.lecturer.user.fullName}</Text>
						<br />
						<Text type="secondary">{thesis.lecturer.user.email}</Text>
						{thesis.lecturer.isModerator && (
							<Tag color="purple" style={{ marginLeft: 8 }}>
								Moderator
							</Tag>
						)}
					</div>
				</div>
			</Space>
		</Modal>
	);
}

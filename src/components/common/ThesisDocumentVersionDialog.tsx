"use client";

import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Modal, Select, Space, Typography, Empty } from "antd";
import { useState } from "react";

import { StorageService } from "@/lib/services/storage.service";
import { showNotification } from "@/lib/utils/notification";

const { Option } = Select;
const { Text, Title } = Typography;

interface ThesisVersion {
	id: string;
	version: number;
	supportingDocument: string;
}

interface Props {
	readonly open: boolean;
	readonly onCancel: () => void;
	readonly thesisVersions: ThesisVersion[];
	readonly thesisTitle: string;
}

export default function ThesisDocumentVersionDialog({
	open,
	onCancel,
	thesisVersions,
	thesisTitle,
}: Props) {
	const [selectedVersionId, setSelectedVersionId] = useState<string>("");
	const [downloading, setDownloading] = useState(false);

	// Set default selected version when dialog opens
	const handleModalOpen = () => {
		if (thesisVersions.length > 0 && !selectedVersionId) {
			setSelectedVersionId(thesisVersions[0].id);
		}
	};

	// Get selected version details
	const selectedVersion = thesisVersions.find(
		(version) => version.id === selectedVersionId,
	);

	// Handle document download
	const handleDownload = async () => {
		if (!selectedVersion?.supportingDocument) {
			showNotification.error(
				"Download Failed",
				"No document available for this version",
			);
			return;
		}

		try {
			setDownloading(true);

			// Get download URL from storage service
			const downloadUrl = await StorageService.getDownloadUrl(
				selectedVersion.supportingDocument,
			);

			// Open download in new tab
			window.open(downloadUrl, "_blank");

			showNotification.success(
				"Download Started",
				`Version ${selectedVersion.version} document download has started`,
			);
		} catch (error) {
			console.error("Download error:", error);
			showNotification.error(
				"Download Failed",
				"Could not download the document",
			);
		} finally {
			setDownloading(false);
		}
	};

	// Get filename from URL
	const getFileName = (url: string) => {
		try {
			return StorageService.getFileNameFromUrl(url);
		} catch {
			return "Document";
		}
	};

	return (
		<Modal
			title="Thesis Document Versions"
			open={open}
			onCancel={onCancel}
			afterOpenChange={(open) => open && handleModalOpen()}
			footer={[
				<Button key="cancel" onClick={onCancel}>
					Close
				</Button>,
				<Button
					key="download"
					type="primary"
					icon={<DownloadOutlined />}
					onClick={handleDownload}
					loading={downloading}
					disabled={!selectedVersion?.supportingDocument}
				>
					Download Document
				</Button>,
			]}
			width={600}
			destroyOnClose
		>
			<Space direction="vertical" size={16} style={{ width: "100%" }}>
				{/* Thesis Title */}
				<div>
					<Text strong style={{ fontSize: 16 }}>
						{thesisTitle}
					</Text>
				</div>

				{/* Version Selection */}
				{thesisVersions.length > 0 ? (
					<>
						<div>
							<Text strong style={{ marginBottom: 8, display: "block" }}>
								Select Version:
							</Text>
							<Select
								style={{ width: "100%" }}
								placeholder="Choose a document version"
								value={selectedVersionId}
								onChange={setSelectedVersionId}
								size="large"
							>
								{thesisVersions.map((version) => (
									<Option key={version.id} value={version.id}>
										<Space>
											<FileTextOutlined />
											Version {version.version}
											{version === thesisVersions[0] && (
												<Text type="secondary">(Latest)</Text>
											)}
										</Space>
									</Option>
								))}
							</Select>
						</div>

						{/* Selected Version Details */}
						{selectedVersion && (
							<div
								style={{
									padding: 16,
									backgroundColor: "#f6f6f6",
									borderRadius: 8,
									border: "1px solid #d9d9d9",
								}}
							>
								<Title level={5} style={{ marginBottom: 8 }}>
									Version {selectedVersion.version} Details
								</Title>
								<Space direction="vertical" size={4}>
									<div>
										<Text strong>Document:</Text>
										<div style={{ marginTop: 4 }}>
											{selectedVersion.supportingDocument ? (
												<Button
													type="link"
													style={{
														padding: 0,
														height: "auto",
														fontSize: "inherit",
														textAlign: "left",
														whiteSpace: "normal",
														wordWrap: "break-word",
														wordBreak: "break-all",
														lineHeight: "1.4",
														display: "inline-block",
														maxWidth: "100%",
													}}
													onClick={handleDownload}
													loading={downloading}
												>
													{getFileName(selectedVersion.supportingDocument)}
												</Button>
											) : (
												<Text type="secondary">No document available</Text>
											)}
										</div>
									</div>
									{selectedVersion === thesisVersions[0] && (
										<Text type="success">
											<Text strong>Status:</Text> Latest Version
										</Text>
									)}
								</Space>
							</div>
						)}
					</>
				) : (
					<Empty
						description="No document versions available"
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				)}
			</Space>
		</Modal>
	);
}

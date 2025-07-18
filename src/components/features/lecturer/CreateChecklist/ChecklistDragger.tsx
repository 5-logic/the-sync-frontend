'use client';

import { CloudUploadOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography, Upload } from 'antd';
import { DraggerProps } from 'antd/es/upload';
import Dragger from 'antd/es/upload/Dragger';
import { UploadFile } from 'antd/es/upload/interface';

import { DownloadTemplateButton } from '@/components/common/DownloadTemplateButton';
import { mockChecklistItems } from '@/data/ChecklistItems';
import { showNotification } from '@/lib/utils/notification';
import { ChecklistItem } from '@/schemas/checklist';

interface Props {
	fileList: UploadFile[];
	setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
	setChecklistItems: (items: ChecklistItem[]) => void;
}

const ChecklistDragger = ({
	fileList,
	setFileList,
	setChecklistItems,
}: Props) => {
	const isExcelFile = (file: File) =>
		file.type ===
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
		file.type === 'application/vnd.ms-excel';

	const isValidFileSize = (file: File) => file.size / 1024 / 1024 < 100;

	const handleUpload = async (file: File) => {
		// Giả lập parse Excel
		const transformedData = mockChecklistItems.map(
			({ id, name, description, isRequired }) => ({
				id,
				name,
				description: description ?? '',
				isRequired,
				acceptance: 'NotAvailable' as const,
				checklistId: '', // or provide a real checklistId if available
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		setChecklistItems(transformedData);
		setFileList([file as unknown as UploadFile]);

		showNotification.success(
			'Import Successful',
			`${transformedData.length} items imported successfully.`,
		);

		return false;
	};

	const draggerProps: DraggerProps = {
		name: 'file',
		beforeUpload: (file) => {
			const isExcel = isExcelFile(file);
			const isLt100MB = isValidFileSize(file);

			if (!isExcel) {
				showNotification.warning(
					'Invalid File Type',
					'You can only upload Excel (.xlsx, .xls) files!',
				);
				return Upload.LIST_IGNORE;
			}

			if (!isLt100MB) {
				showNotification.error(
					'File Too Large',
					'File must be smaller than 100MB!',
				);
				return Upload.LIST_IGNORE;
			}

			return handleUpload(file);
		},
		fileList,
		onRemove: () => {
			setFileList([]);
			setChecklistItems([]);
		},
		maxCount: 1,
		accept: '.xlsx,.xls',
	};

	return (
		<>
			<Card
				style={{
					border: '1px solid #f0f0f0',
					borderRadius: 8,
					background: '#fafafa',
					marginBottom: 16,
				}}
			>
				<Row align="middle" justify="space-between" gutter={[16, 16]} wrap>
					<Col xs={24} sm={24} md={16}>
						<Typography.Text type="secondary" style={{ display: 'block' }}>
							Please fill the template including Name, Description and Priority.
						</Typography.Text>
					</Col>
					<Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
						{/* download template button */}
						<DownloadTemplateButton
							templateFileName="Create Checklist Template.xlsx"
							buttonText="Download Checklist Template"
							buttonType="primary"
						/>
					</Col>
				</Row>
			</Card>

			<Dragger {...draggerProps}>
				<p className="ant-upload-drag-icon">
					<CloudUploadOutlined />
				</p>
				<p className="ant-upload-text">
					Drag and drop Excel file here, or click to browse
				</p>
				<p className="ant-upload-hint text-gray-400">
					Supports .xlsx and .xls files up to 100MB
				</p>
			</Dragger>
		</>
	);
};

export default ChecklistDragger;

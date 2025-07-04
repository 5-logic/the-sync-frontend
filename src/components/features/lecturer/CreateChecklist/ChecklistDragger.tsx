'use client';

import { CloudUploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Typography, Upload, message } from 'antd';
import { DraggerProps } from 'antd/es/upload';
import Dragger from 'antd/es/upload/Dragger';
import { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

import { ChecklistItem } from '@/components/features/lecturer/CreateChecklist/ImportChecklistExcel';

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
	const [downloading, setDownloading] = useState(false);
	const templateFileName = 'checklist-template.xlsx';

	const isExcelFile = (file: File) =>
		file.type ===
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
		file.type === 'application/vnd.ms-excel';

	const isValidFileSize = (file: File) => file.size / 1024 / 1024 < 100;

	const handleUpload = async (file: File) => {
		// Mock parse logic
		const dummyData = [
			{
				id: '1',
				name: 'Submit Proposal Document',
				description: 'Upload your proposal as PDF',
				isRequired: true,
			},
			{
				id: '2',
				name: 'Initial Presentation',
				description: 'Slides + recording required',
				isRequired: false,
			},
		];
		setChecklistItems(dummyData);
		setFileList([file as unknown as UploadFile]);
		message.success(`${dummyData.length} items imported successfully`);
		return false;
	};

	const handleDownloadTemplate = () => {
		setDownloading(true);
		setTimeout(() => {
			message.success('Template downloaded');
			setDownloading(false);
		}, 1000);
	};

	const draggerProps: DraggerProps = {
		name: 'file',
		beforeUpload: (file) => {
			const isExcel = isExcelFile(file);
			const isLt100MB = isValidFileSize(file);

			if (!isExcel) {
				message.warning('You can only upload Excel (.xlsx, .xls) files!');
				return Upload.LIST_IGNORE;
			}

			if (!isLt100MB) {
				message.error('File must be smaller than 100MB!');
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
							Please fill the template including Name, Description and Required.
						</Typography.Text>
					</Col>
					<Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
						<Button
							icon={<DownloadOutlined />}
							type="default"
							onClick={handleDownloadTemplate}
							disabled={!templateFileName || downloading}
							loading={downloading}
							title={
								!templateFileName
									? 'Template file not available'
									: 'Download Excel template'
							}
						>
							{downloading ? 'Downloading...' : 'Download Template'}
						</Button>
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

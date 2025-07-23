import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';
import React from 'react';

type Props = {
	searchText: string;
	onSearchChange: (text: string) => void;
	selectedSemester: string;
	onSemesterChange: (semester: string) => void;
	availableSemesters: string[];
	onExportExcel?: () => void;
	onExportPdf?: () => void;
	searchPlaceholder?: string;
	exportExcelText?: string;
	exportPdfText?: string;
	showExportExcel?: boolean;
	showExportPdf?: boolean;
	loading?: boolean;
};

export const FilterBar = ({
	searchText,
	onSearchChange,
	selectedSemester,
	onSemesterChange,
	availableSemesters,
	onExportExcel,
	onExportPdf,
	searchPlaceholder = 'Search...',
	exportExcelText = 'Export Excel',
	exportPdfText = 'Export PDF',
	showExportExcel = false,
	showExportPdf = false,
	loading = false,
}: Props) => {
	const semesterOptions = availableSemesters.filter(
		(semester) => semester !== 'all',
	);

	return (
		<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
			<Col flex="auto">
				<Input
					placeholder={searchPlaceholder}
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					prefix={<SearchOutlined />}
					allowClear
					size="middle"
					disabled={loading}
				/>
			</Col>
			<Col style={{ width: 150 }}>
				<Select
					value={selectedSemester}
					onChange={onSemesterChange}
					style={{ width: '100%' }}
					size="middle"
					placeholder="Select Semester"
					disabled={loading}
				>
					<Select.Option value="all">All Semesters</Select.Option>
					{semesterOptions.map((semester) => (
						<Select.Option key={semester} value={semester}>
							{semester}
						</Select.Option>
					))}
				</Select>
			</Col>
			{showExportExcel && (
				<Col style={{ width: 150 }}>
					<Button
						icon={<ExportOutlined />}
						type="primary"
						size="middle"
						style={{ width: '100%' }}
						onClick={onExportExcel}
						disabled={loading}
					>
						{exportExcelText}
					</Button>
				</Col>
			)}
			{showExportPdf && (
				<Col>
					<Button
						icon={<ExportOutlined />}
						type="primary"
						size="middle"
						onClick={onExportPdf}
						disabled={loading}
					>
						{exportPdfText}
					</Button>
				</Col>
			)}
		</Row>
	);
};

import {
	ExportOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Input, Row, Select } from 'antd';
import React from 'react';

type Props = {
	searchText: string;
	onSearchChange: (text: string) => void;
	selectedSemester: string;
	onSemesterChange: (semester: string) => void;
	availableSemesters: string[];
	onExportExcel?: () => void;
	onRefresh?: () => void;
	searchPlaceholder?: string;
	exportExcelText?: string;
	showExportExcel?: boolean;
	loading?: boolean;
};

export const FilterBar = ({
	searchText,
	onSearchChange,
	selectedSemester,
	onSemesterChange,
	availableSemesters,
	onExportExcel,
	onRefresh,
	searchPlaceholder = 'Search...',
	exportExcelText = 'Export Excel',
	showExportExcel = false,
	loading = false,
}: Props) => {
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
					{availableSemesters.map((semester) => (
						<Select.Option key={semester} value={semester}>
							{semester}
						</Select.Option>
					))}
				</Select>
			</Col>
			{onRefresh && (
				<Col>
					<Button
						icon={<ReloadOutlined />}
						size="middle"
						onClick={onRefresh}
						disabled={loading}
						title="Refresh data"
					>
						Refresh
					</Button>
				</Col>
			)}
			{showExportExcel && (
				<Col style={{ width: 150 }}>
					<Button
						icon={<ExportOutlined />}
						type="primary"
						size="middle"
						style={{ width: '100%' }}
						onClick={onExportExcel}
						disabled={loading}
						title="Export to Excel"
					>
						{exportExcelText}
					</Button>
				</Col>
			)}
		</Row>
	);
};

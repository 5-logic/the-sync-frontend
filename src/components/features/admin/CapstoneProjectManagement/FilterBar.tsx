import {
	ExportOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Col, Input, Row, Select, Tooltip } from "antd";
import React from "react";

import { useSemesterExportValidation } from "@/hooks/admin/useSemesterExportValidation";
import { Semester } from "@/schemas/semester";

interface SemesterOption {
	id: string;
	name: string;
	code: string;
	status: string;
	ongoingPhase?: string | null;
}

type Props = {
	searchText: string;
	onSearchChange: (text: string) => void;
	selectedSemester: string;
	onSemesterChange: (semesterId: string) => void;
	availableSemesters: SemesterOption[];
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
	searchPlaceholder = "Search...",
	exportExcelText = "Export Excel",
	showExportExcel = false,
	loading = false,
}: Props) => {
	// Validate export permissions for selected semester
	const { canExport, reason } = useSemesterExportValidation(
		selectedSemester,
		availableSemesters as Semester[],
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
					style={{ width: "100%" }}
					size="middle"
					placeholder="Select Semester"
					disabled={loading}
					showSearch
					optionFilterProp="children"
					filterOption={(input, option) =>
						String(option?.children || "")
							.toLowerCase()
							.includes(input.toLowerCase())
					}
				>
					{availableSemesters.map((semester) => (
						<Select.Option key={semester.id} value={semester.id}>
							{semester.name}
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
					<Tooltip title={!canExport ? reason : ""}>
						<Button
							icon={<ExportOutlined />}
							type="primary"
							size="middle"
							style={{ width: "100%" }}
							onClick={onExportExcel}
							disabled={loading || !canExport}
							title="Export to Excel"
						>
							{exportExcelText}
						</Button>
					</Tooltip>
				</Col>
			)}
		</Row>
	);
};

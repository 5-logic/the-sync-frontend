"use client";

import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { memo } from "react";

import { TablePagination } from "@/components/common/TablePagination";
import { type SupervisorAssignmentData } from "@/store/useAssignSupervisorStore";

interface Props {
	readonly data: SupervisorAssignmentData[];
	readonly columns: ColumnsType<SupervisorAssignmentData>;
	readonly loading?: boolean;
	readonly rowKey?: string | ((record: SupervisorAssignmentData) => string);
	readonly onChange?: TableProps<SupervisorAssignmentData>["onChange"];
}

/**
 * Optimized Table component for displaying supervisor assignment data
 * Uses React.memo to prevent unnecessary re-renders
 * Responsive design with percentage-based widths
 */
const ThesisOverviewTable = memo<Props>(
	({ data, columns, loading = false, rowKey = "id", onChange }) => {
		return (
			<Table
				rowKey={rowKey}
				columns={columns}
				dataSource={data}
				loading={loading}
				pagination={TablePagination}
				onChange={onChange}
				tableLayout="fixed"
				size="small"
				scroll={{ x: "max-content" }}
			/>
		);
	},
);

ThesisOverviewTable.displayName = "ThesisOverviewTable";

export default ThesisOverviewTable;

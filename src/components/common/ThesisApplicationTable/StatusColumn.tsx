import { Tag } from "antd";

// Status color mapping
export const getStatusColor = (status: string): string => {
	switch (status) {
		case "Pending":
			return "orange";
		case "Approved":
			return "green";
		case "Rejected":
			return "red";
		case "Cancelled":
			return "gray";
		default:
			return "default";
	}
};

interface StatusColumnProps {
	readonly status: string;
}

export function StatusColumn({ status }: StatusColumnProps) {
	return <Tag color={getStatusColor(status)}>{status}</Tag>;
}

// Column definition for reuse
export const createStatusColumn = (width: string = "12%") => ({
	title: "Status",
	dataIndex: "status",
	key: "status",
	width,
	align: "center" as const,
	render: (status: string) => <StatusColumn status={status} />,
});

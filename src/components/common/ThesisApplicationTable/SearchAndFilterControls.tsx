"use client";

import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select } from "antd";

interface SearchAndFilterControlsProps {
	readonly searchText: string;
	readonly onSearchChange: (value: string) => void;
	readonly statusFilter: string;
	readonly onStatusFilterChange: (value: string) => void;
	readonly onRefresh: () => void;
	readonly loading?: boolean;
	readonly searchPlaceholder?: string;
	readonly showCancelledStatus?: boolean;
}

export default function SearchAndFilterControls({
	searchText,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	onRefresh,
	loading = false,
	searchPlaceholder = "Search by thesis name...",
	showCancelledStatus = false,
}: SearchAndFilterControlsProps) {
	return (
		<div
			style={{
				marginBottom: 16,
				display: "flex",
				gap: "12px",
				alignItems: "center",
			}}
		>
			{/* Search Input */}
			<Input
				placeholder={searchPlaceholder}
				prefix={<SearchOutlined />}
				value={searchText}
				onChange={(e) => onSearchChange(e.target.value)}
				style={{ flex: 1 }}
				allowClear
			/>

			{/* Status Filter */}
			<Select
				placeholder="Filter by status"
				value={statusFilter || undefined}
				onChange={(value) => onStatusFilterChange(value || "")}
				style={{ width: 160 }}
				allowClear
			>
				<Select.Option value="Pending">Pending</Select.Option>
				<Select.Option value="Approved">Approved</Select.Option>
				<Select.Option value="Rejected">Rejected</Select.Option>
				{showCancelledStatus && (
					<Select.Option value="Cancelled">Cancelled</Select.Option>
				)}
			</Select>

			{/* Refresh Button */}
			<Button
				icon={<ReloadOutlined />}
				onClick={onRefresh}
				loading={loading}
				style={{ minWidth: 100 }}
			>
				Refresh
			</Button>
		</div>
	);
}

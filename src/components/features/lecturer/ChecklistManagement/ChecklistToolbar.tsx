"use client";

import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Col, Input, Row, Select } from "antd";
import { useEffect, useState } from "react";

import { useMilestoneStore } from "@/store";

interface Props {
	readonly onSearchChange: (val: string) => void;
	readonly onMilestoneChange?: (milestoneId: string | null) => void;
	readonly onCreate?: () => void;
	readonly onRefresh?: () => void;
	readonly buttonLabel?: string;
	readonly hideButton?: boolean;
	readonly loading?: boolean;
}

export default function ChecklistToolbar({
	onSearchChange,
	onMilestoneChange,
	onCreate,
	onRefresh,
	buttonLabel = "Create New Checklist",
	hideButton = false,
	loading = false,
}: Props) {
	const [searchValue, setSearchValue] = useState("");
	const [selectedMilestone, setSelectedMilestone] = useState<string | null>("");

	const {
		milestones,
		loading: milestonesLoading,
		fetchMilestones,
	} = useMilestoneStore();

	useEffect(() => {
		fetchMilestones();
	}, [fetchMilestones]);

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		onSearchChange(value);
	};

	const handleMilestoneChange = (value: string | null) => {
		setSelectedMilestone(value);
		// Convert empty string to null for the parent component
		onMilestoneChange?.(value === "" ? null : value);
	};

	return (
		<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
			{/* Search input - chiếm không gian còn lại */}
			<Col flex="1" style={{ minWidth: 200 }}>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search by name, description..."
					value={searchValue}
					onChange={(e) => handleSearchChange(e.target.value)}
					size="middle"
				/>
			</Col>

			{/* Milestone filter - chiều rộng cố định */}
			<Col style={{ width: 220 }}>
				<Select
					placeholder="Filter by milestone"
					value={selectedMilestone}
					onChange={handleMilestoneChange}
					allowClear
					style={{ width: "100%" }}
					loading={milestonesLoading}
					size="middle"
				>
					<Select.Option value="">All Milestones</Select.Option>
					{milestones.map((milestone) => (
						<Select.Option key={milestone.id} value={milestone.id}>
							{milestone.name}
						</Select.Option>
					))}
				</Select>
			</Col>

			{/* Refresh button */}
			<Col>
				<Button
					icon={<ReloadOutlined />}
					onClick={onRefresh}
					loading={loading}
					size="middle"
					title="Refresh data"
					style={{ minWidth: 100 }}
				>
					Refresh
				</Button>
			</Col>

			{/* Create button */}
			{!hideButton && (
				<Col>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={onCreate}
						size="middle"
						style={{ minWidth: 160 }}
					>
						{buttonLabel}
					</Button>
				</Col>
			)}
		</Row>
	);
}

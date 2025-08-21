"use client";

import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Select } from "antd";

import { useLecturerStore } from "@/store/useLecturerStore";

const { Option } = Select;

type Props = Readonly<{
	onCreateLecturer: () => void;
	onRefresh: () => void;
	loading?: boolean;
}>;

export default function LecturerFilterBar({
	onCreateLecturer,
	onRefresh,
	loading = false,
}: Props) {
	const {
		selectedStatus,
		selectedModerator,
		searchText,
		setSelectedStatus,
		setSelectedModerator,
		setSearchText,
	} = useLecturerStore();
	return (
		<div className="flex items-center gap-2 w-full">
			<Select
				value={selectedStatus}
				onChange={setSelectedStatus}
				style={{ width: 150, flexShrink: 0 }}
				placeholder="Select Status"
				size="middle"
			>
				<Option value="All">All Status</Option>
				<Option value="Active">Active</Option>
				<Option value="Inactive">Inactive</Option>
			</Select>

			<Select
				value={selectedModerator}
				onChange={setSelectedModerator}
				style={{ width: 120, flexShrink: 0 }}
				placeholder="Select Role"
				size="middle"
			>
				<Option value="All">All Lecturers</Option>
				<Option value="Moderator">Moderator</Option>
			</Select>

			{/* Search input - expands to fill available space */}
			<div style={{ flex: 1, minWidth: 200 }}>
				<Input
					placeholder="Search by name, email"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					prefix={<SearchOutlined style={{ color: "#aaa" }} />}
					size="middle"
				/>
			</div>

			<Button
				icon={<ReloadOutlined />}
				onClick={onRefresh}
				loading={loading}
				size="middle"
				title="Refresh data"
				style={{ flexShrink: 0 }}
			>
				Refresh
			</Button>

			<Button
				icon={<PlusOutlined />}
				type="primary"
				onClick={onCreateLecturer}
				size="middle"
				style={{ flexShrink: 0 }}
			>
				Create New Lecturer
			</Button>
		</div>
	);
}

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
		<div className="w-full">
			{/* Container với responsive behavior */}
			<div className="flex flex-col lg:flex-row gap-3 lg:items-center">
				{/* Top row: Filters */}
				<div className="flex flex-col sm:flex-row gap-3 lg:gap-2 flex-1">
					{/* Status Select */}
					<div className="w-full sm:w-auto lg:w-40 lg:flex-shrink-0">
						<Select
							value={selectedStatus}
							onChange={setSelectedStatus}
							style={{ width: "100%" }}
							placeholder="Select Status"
							size="middle"
						>
							<Option value="All">All Status</Option>
							<Option value="Active">Active</Option>
							<Option value="Inactive">Inactive</Option>
						</Select>
					</div>

					{/* Moderator Select */}
					<div className="w-full sm:w-auto lg:w-36 lg:flex-shrink-0">
						<Select
							value={selectedModerator}
							onChange={setSelectedModerator}
							style={{ width: "100%" }}
							placeholder="Select Role"
							size="middle"
						>
							<Option value="All">All Lecturers</Option>
							<Option value="Moderator">Moderator</Option>
						</Select>
					</div>

					{/* Search Input */}
					<div className="flex-1 min-w-0">
						<Input
							placeholder="Search by name, email"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							prefix={<SearchOutlined style={{ color: "#aaa" }} />}
							size="middle"
							style={{ width: "100%" }}
						/>
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex flex-col sm:flex-row gap-3 lg:gap-2 lg:flex-shrink-0">
					<Button
						icon={<ReloadOutlined />}
						onClick={onRefresh}
						loading={loading}
						size="middle"
						title="Refresh data"
						className="w-full sm:w-auto"
					>
						Refresh
					</Button>

					<Button
						icon={<PlusOutlined />}
						type="primary"
						onClick={onCreateLecturer}
						size="middle"
						className="w-full sm:w-auto"
					>
						Create New Lecturer
					</Button>
				</div>
			</div>
		</div>
	);
}

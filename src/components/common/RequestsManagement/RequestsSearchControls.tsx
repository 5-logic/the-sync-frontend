import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';

interface RequestsSearchControlsProps {
	readonly searchText: string;
	readonly statusFilter: string | undefined;
	readonly loading: boolean;
	readonly onSearchChange: (value: string) => void;
	readonly onStatusFilterChange: (value: string | undefined) => void;
	readonly onRefresh: () => void;
}

export default function RequestsSearchControls({
	searchText,
	statusFilter,
	loading,
	onSearchChange,
	onStatusFilterChange,
	onRefresh,
}: RequestsSearchControlsProps) {
	return (
		<div className="mb-4 flex gap-3 items-center">
			<Input
				prefix={<SearchOutlined />}
				placeholder="Search by name, student code, or email..."
				value={searchText}
				onChange={(e) => onSearchChange(e.target.value)}
				className="flex-1"
				allowClear
			/>
			<Select
				value={statusFilter}
				onChange={onStatusFilterChange}
				style={{ width: 140 }}
				placeholder="All Status"
				allowClear
				options={[
					{ label: 'Pending', value: 'Pending' },
					{ label: 'Approved', value: 'Approved' },
					{ label: 'Rejected', value: 'Rejected' },
					{ label: 'Cancelled', value: 'Cancelled' },
				]}
			/>
			<Button
				icon={<ReloadOutlined />}
				onClick={onRefresh}
				loading={loading}
				title="Refresh data"
			>
				Refresh
			</Button>
		</div>
	);
}

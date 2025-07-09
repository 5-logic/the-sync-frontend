import RequestsSearchControls from '@/components/common/RequestsManagement/RequestsSearchControls';
import RequestsTable from '@/components/common/RequestsManagement/RequestsTable';
import { type RequestsTabProps } from '@/components/common/RequestsManagement/types';

export default function RequestsTab({
	requestType,
	dataSource,
	loading,
	searchText,
	statusFilter,
	onSearchChange,
	onStatusFilterChange,
	onRefresh,
	mode,
	getActionProps,
}: Readonly<RequestsTabProps>) {
	return (
		<div>
			<RequestsSearchControls
				searchText={searchText}
				statusFilter={statusFilter}
				loading={loading}
				onSearchChange={onSearchChange}
				onStatusFilterChange={onStatusFilterChange}
				onRefresh={onRefresh}
			/>

			<RequestsTable
				dataSource={dataSource}
				loading={loading}
				requestType={requestType}
				mode={mode}
				getActionProps={getActionProps}
			/>
		</div>
	);
}

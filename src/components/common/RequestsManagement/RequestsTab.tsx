import { type RequestsTabProps } from '@/components/common/RequestsManagement/types';

import RequestsSearchControls from './RequestsSearchControls';
import RequestsTable from './RequestsTable';

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
}: RequestsTabProps) {
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

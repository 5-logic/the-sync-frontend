import RequestsSearchControls from './RequestsSearchControls';
import RequestsTable from './RequestsTable';
import { type RequestsTabProps } from './types';

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

'use client';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { ExtendedGroup } from '@/data/group';

interface Props {
	readonly data: ExtendedGroup[];
	readonly columns: ColumnsType<ExtendedGroup>;
	readonly showPagination?: boolean;
	readonly rowKey?: keyof ExtendedGroup;
}

export default function GroupOverviewTable({
	data,
	columns,
	showPagination = true,
	rowKey = 'id',
}: Props) {
	return (
		<Table
			rowKey={rowKey as string}
			columns={columns}
			dataSource={data}
			pagination={
				showPagination
					? {
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} of ${total} items`,
							showSizeChanger: true,
							pageSizeOptions: ['10', '20', '50', '100'],
							defaultPageSize: 10,
						}
					: false
			}
			scroll={{ x: 'max-content' }}
		/>
	);
}

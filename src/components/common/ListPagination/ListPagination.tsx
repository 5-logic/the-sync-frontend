'use client';

import { Pagination } from 'antd';
import type { PaginationProps } from 'antd';

interface ListPaginationProps extends PaginationProps {
	total: number;
	current: number;
	pageSize: number;
	onChange: (page: number, pageSize: number) => void;
	onShowSizeChange?: (current: number, size: number) => void;
	itemName?: string;
}

export default function ListPagination({
	total,
	current,
	pageSize,
	onChange,
	onShowSizeChange,
	itemName = 'items',
	...props
}: ListPaginationProps) {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginTop: 16,
				padding: '16px 0',
			}}
		>
			<div style={{ color: '#666', fontSize: 14 }}>
				Showing {Math.min((current - 1) * pageSize + 1, total)}-
				{Math.min(current * pageSize, total)} of {total} {itemName}
			</div>
			<Pagination
				current={current}
				total={total}
				pageSize={pageSize}
				onChange={onChange}
				onShowSizeChange={onShowSizeChange || onChange}
				showSizeChanger
				showQuickJumper
				pageSizeOptions={['6', '12', '18', '24']}
				showTotal={(total, range) =>
					`${range[0]}-${range[1]} of ${total} ${itemName}`
				}
				{...props}
			/>
		</div>
	);
}

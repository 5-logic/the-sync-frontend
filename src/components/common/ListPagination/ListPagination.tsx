'use client';

import { Pagination } from 'antd';
import type { PaginationProps } from 'antd';

interface ListPaginationProps extends PaginationProps {
	readonly total: number;
	readonly current: number;
	readonly pageSize: number;
	readonly onChange: (page: number, pageSize: number) => void;
	readonly onShowSizeChange?: (current: number, size: number) => void;
	readonly itemName?: string;
}

const DEFAULT_ITEM_NAME = 'items';
const DEFAULT_PAGE_SIZE_OPTIONS = ['6', '12', '18', '24'];

const PAGINATION_STYLES = {
	container: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 16,
		padding: '16px 0',
	} as const,
	info: {
		color: '#666',
		fontSize: 14,
	} as const,
};

export default function ListPagination({
	total,
	current,
	pageSize,
	onChange,
	onShowSizeChange,
	itemName = DEFAULT_ITEM_NAME,
	...props
}: ListPaginationProps) {
	const startIndex = Math.min((current - 1) * pageSize + 1, total);
	const endIndex = Math.min(current * pageSize, total);

	const handleShowSizeChange = onShowSizeChange || onChange;

	return (
		<div style={PAGINATION_STYLES.container}>
			<div style={PAGINATION_STYLES.info}>
				Showing {startIndex}-{endIndex} of {total} {itemName}
			</div>
			<Pagination
				current={current}
				total={total}
				pageSize={pageSize}
				onChange={onChange}
				onShowSizeChange={handleShowSizeChange}
				showSizeChanger
				showQuickJumper
				pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
				showTotal={(totalItems, range) =>
					`${range[0]}-${range[1]} of ${totalItems} ${itemName}`
				}
				{...props}
			/>
		</div>
	);
}

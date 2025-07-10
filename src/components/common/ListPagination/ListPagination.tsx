'use client';

import { Grid, Pagination } from 'antd';
import type { PaginationProps } from 'antd';

const { useBreakpoint } = Grid;

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
		flexDirection: 'column',
		gap: 8,
		marginTop: 16,
		padding: '12px 0',
	} as const,
	containerTablet: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		marginTop: 16,
		padding: '16px 0',
	} as const,
	containerDesktop: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 16,
		padding: '16px 0',
	} as const,
	info: {
		color: '#666',
		fontSize: 12,
		textAlign: 'center',
	} as const,
	infoTablet: {
		color: '#666',
		fontSize: 14,
		textAlign: 'center',
	} as const,
	infoDesktop: {
		color: '#666',
		fontSize: 14,
		textAlign: 'left',
	} as const,
	paginationContainer: {
		display: 'flex',
		justifyContent: 'center',
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
	const screens = useBreakpoint();
	const startIndex = Math.min((current - 1) * pageSize + 1, total);
	const endIndex = Math.min(current * pageSize, total);

	const handleShowSizeChange = onShowSizeChange ?? onChange;

	const isMobile = !screens.sm;
	const isTablet = screens.sm && !screens.lg;
	const isDesktop = screens.lg;

	let containerStyle, infoStyle;
	if (isDesktop) {
		containerStyle = PAGINATION_STYLES.containerDesktop;
		infoStyle = PAGINATION_STYLES.infoDesktop;
	} else if (isTablet) {
		containerStyle = PAGINATION_STYLES.containerTablet;
		infoStyle = PAGINATION_STYLES.infoTablet;
	} else {
		containerStyle = PAGINATION_STYLES.container;
		infoStyle = PAGINATION_STYLES.info;
	}

	const paginationConfig = {
		showSizeChanger: isDesktop,
		showQuickJumper: isDesktop,
		simple: isMobile,
		size: isMobile ? 'small' : 'default',
		showTotal: isDesktop
			? (totalItems: number, range: [number, number]) =>
					`${range[0]}-${range[1]} of ${totalItems} ${itemName}`
			: undefined,
		showLessItems: isTablet ?? isMobile,
		responsive: true,
	} as const;

	return (
		<div style={containerStyle}>
			<div style={infoStyle}>
				Showing {startIndex}-{endIndex} of {total} {itemName}
			</div>
			<div
				style={isDesktop ? undefined : PAGINATION_STYLES.paginationContainer}
			>
				<Pagination
					current={current}
					total={total}
					pageSize={pageSize}
					onChange={onChange}
					onShowSizeChange={handleShowSizeChange}
					pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
					{...paginationConfig}
					{...props}
				/>
			</div>
		</div>
	);
}

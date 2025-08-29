import type { TableProps } from 'antd';

// Common table configuration for thesis applications
export const getThesisApplicationTableConfig = <
	T extends Record<string, unknown>,
>(
	itemName: string = 'applications',
): Pick<TableProps<T>, 'pagination' | 'scroll' | 'size'> => ({
	pagination: {
		showSizeChanger: true,
		showQuickJumper: true,
		showTotal: (total, range) =>
			`${range[0]}-${range[1]} of ${total} ${itemName}`,
		pageSizeOptions: ['10', '20', '50'],
		defaultPageSize: 20,
	},
	scroll: { x: 800 },
	size: 'small',
});

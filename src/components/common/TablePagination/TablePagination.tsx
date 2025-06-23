'use client';

import type { TablePaginationConfig } from 'antd/es/table';

const TablePagination: TablePaginationConfig = {
	showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
	showSizeChanger: true,
	pageSizeOptions: ['5', '10', '20', '50'],
	defaultPageSize: 10,
};

export default TablePagination;

'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

interface Props {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
}

/**
 * Search bar component for filtering groups or thesis titles
 */

export default function GroupSearchBar({
	value,
	onChange,
	placeholder = 'Search groups or thesis',
}: Readonly<Props>) {
	return (
		<Input
			allowClear
			prefix={<SearchOutlined />}
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}

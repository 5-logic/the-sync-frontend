'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

interface Props {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
}

export default function GroupSearchBar({
	value,
	onChange,
	placeholder = 'Search groups or thesis',
}: Props) {
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

'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { memo, useCallback } from 'react';

interface Props {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
}

/**
 * Optimized Search bar component for filtering groups or thesis titles
 * Uses React.memo and useCallback to prevent unnecessary re-renders
 */
const GroupSearchBar = memo<Props>(
	({ value, onChange, placeholder = 'Search groups or thesis' }) => {
		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange(e.target.value);
			},
			[onChange],
		);

		return (
			<Input
				allowClear
				prefix={<SearchOutlined />}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				style={{ width: '100%' }}
			/>
		);
	},
);

GroupSearchBar.displayName = 'GroupSearchBar';

export default GroupSearchBar;

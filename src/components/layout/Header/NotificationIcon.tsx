'use client';

import { BellOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import React from 'react';

const NotificationIcon: React.FC = () => (
	<div className="mr-6">
		<Badge count={1} size="small">
			<BellOutlined
				style={{
					fontSize: '24px',
					color: '#6b7280',
					cursor: 'pointer',
				}}
				className="hover:text-blue-600 transition-colors"
			/>
		</Badge>
	</div>
);

export default NotificationIcon;

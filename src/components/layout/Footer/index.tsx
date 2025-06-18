'use client';

import { CopyrightOutlined, HeartFilled } from '@ant-design/icons';
import { Layout } from 'antd';
import React from 'react';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();
	return (
		<AntFooter
			style={{
				backgroundColor: '#ffffff',
				borderTop: '1px solid #e8e8e8',
				padding: '16px 24px',
				textAlign: 'center',
			}}
		>
			<div className="flex flex-col items-center gap-2 text-gray-600">
				{/* Main Copyright */}
				<div className="flex items-center gap-1 text-sm">
					<CopyrightOutlined />
					<span>{currentYear} TheSync - GCIF Platform.</span>
					<span>All rights reserved.</span>
				</div>

				{/* Additional Info */}
				<div className="flex items-center gap-1 text-xs text-gray-500">
					<span>Made with</span>
					<HeartFilled className="text-red-500" />
					<span>for FPT University students at Quy Nhon Campus</span>
				</div>

				{/* Version Info */}
				<div className="text-xs text-gray-400">
					Application to Support Group Formation and Capstone Thesis Development
				</div>
			</div>
		</AntFooter>
	);
};

export default Footer;

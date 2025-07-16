// components/common/StatCard.tsx
import { Card } from 'antd';
import React from 'react';

interface StatCardProps {
	value: number;
	title: string;
	icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, title, icon }) => {
	return (
		<Card>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<div>
					<div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
					<div style={{ color: '#888' }}>{title}</div>
				</div>
				{icon}
			</div>
		</Card>
	);
};

export default StatCard;

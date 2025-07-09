'use client';

import { Badge, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

type Props = Readonly<{
	title: string;
	description?: string;
	badgeText?: string;
}>;

export default function Header({ title, description, badgeText }: Props) {
	return (
		<div>
			<Title level={2} style={{ marginBottom: 4 }}>
				{title}
				{badgeText && (
					<Badge
						count={badgeText}
						color="gold"
						style={{ marginLeft: 12, verticalAlign: 'middle' }}
					/>
				)}
			</Title>

			{description && (
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					{description}
				</Paragraph>
			)}
		</div>
	);
}

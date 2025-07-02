'use client';

import { Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

type Props = Readonly<{
	text: string;
	isRequired?: boolean;
	isBold?: boolean;
	className?: string;
}>;

export default function FormLabel({
	text,
	isRequired = false,
	isBold = false,
	className = '',
}: Props) {
	return (
		<Text className={className} strong={isBold}>
			{text}
			{isRequired && <Text type="danger"> *</Text>}
		</Text>
	);
}

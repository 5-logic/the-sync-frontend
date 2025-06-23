'use client';

import { Badge, Col, Row, Typography } from 'antd';

const { Title, Text } = Typography;

interface Props {
	readonly title: string;
	readonly description?: string;
	readonly badgeText?: string;
	readonly badgeColor?: string;
}

export default function PageHeader({
	title,
	description,
	badgeText,
	badgeColor = 'gold',
}: Props) {
	return (
		<div className="flex justify-between items-center mb-6">
			<div>
				<Row align="middle" gutter={12} className="mb-2">
					<Col>
						<Title level={2} style={{ marginBottom: 0 }}>
							{title}
						</Title>
					</Col>
					{badgeText && (
						<Col>
							<Badge count={badgeText} color={badgeColor} />
						</Col>
					)}
				</Row>
				{description && <Text type="secondary">{description}</Text>}
			</div>
		</div>
	);
}

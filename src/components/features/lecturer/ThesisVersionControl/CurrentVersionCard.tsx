import { Card, Col, Row, Typography } from 'antd';

import { ExtendedThesis } from '@/data/thesis';

import ThesisFileVersionCard from './ThesisFileVersionCard';

const { Text, Title } = Typography;

interface Props {
	thesis: ExtendedThesis;
	versionData: {
		version: string;
		fileName: string;
		fileSize: string;
		uploadedAt: string;
	};
}

const CurrentVersionCard = ({ thesis, versionData }: Props) => (
	<Card
		title={
			<Title level={5} style={{ margin: 0 }}>
				Current Version
			</Title>
		}
		extra={<Text type="secondary">v{versionData.version}</Text>}
	>
		<Row gutter={[0, 16]}>
			<Col span={24}>
				<Text strong type="secondary">
					Thesis Title
				</Text>
				<div>{thesis.englishName}</div>
			</Col>

			<Col span={24}>
				<Text strong type="secondary">
					Thesis Description
				</Text>
				<div>{thesis.description}</div>
			</Col>

			<Col span={24}>
				<ThesisFileVersionCard file={versionData} />
			</Col>
		</Row>
	</Card>
);

export default CurrentVersionCard;

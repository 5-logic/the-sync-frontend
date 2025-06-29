import { Card, Col, Row, Typography } from 'antd';

import ThesisFileVersionCard from '@/components/features/lecturer/ThesisVersionControl/ThesisFileVersionCard';
import { ExtendedThesis } from '@/data/thesis';

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
			<Col xs={24}>
				<Text strong type="secondary">
					Thesis Title
				</Text>
				<div style={{ wordBreak: 'break-word' }}>{thesis.englishName}</div>
			</Col>

			<Col xs={24}>
				<Text strong type="secondary">
					Thesis Description
				</Text>
				<div style={{ wordBreak: 'break-word' }}>{thesis.description}</div>
			</Col>

			<Col xs={24}>
				<ThesisFileVersionCard file={versionData} />
			</Col>
		</Row>
	</Card>
);

export default CurrentVersionCard;

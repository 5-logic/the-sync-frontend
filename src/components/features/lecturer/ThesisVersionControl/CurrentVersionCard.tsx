import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Typography } from 'antd';

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
			<Col span={24}>
				<Text strong>Thesis Title</Text>
				<div>{thesis.englishName}</div>
			</Col>

			<Col span={24}>
				<Text strong>Thesis Description</Text>
				<div>{thesis.description}</div>
			</Col>

			<Col span={24}>
				<Card
					type="inner"
					bordered={false}
					style={{ backgroundColor: '#fafafa' }}
					bodyStyle={{ padding: '12px 8px' }}
				>
					<Row align="middle" justify="space-between" wrap={false}>
						<Col>
							<Space align="start">
								<FileTextOutlined
									style={{ fontSize: 25, color: '#1890ff', marginTop: 5 }}
								/>
								<div>
									<div>{versionData.fileName}</div>
									<Text type="secondary">
										{versionData.fileSize} • Uploaded on{' '}
										{versionData.uploadedAt}
									</Text>
								</div>
							</Space>
						</Col>

						<Col>
							<Button
								type="primary"
								icon={<DownloadOutlined />}
								style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
							>
								Download
							</Button>
						</Col>
					</Row>
				</Card>
			</Col>
		</Row>
	</Card>
);

export default CurrentVersionCard;

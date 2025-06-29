import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Typography } from 'antd';

const { Text } = Typography;

export interface FileVersionData {
	fileName: string;
	fileSize: string;
	uploadedAt: string;
}

interface Props {
	file: FileVersionData;
}

const ThesisFileVersionCard = ({ file }: Props) => {
	return (
		<Card
			type="inner"
			bordered={false}
			style={{ backgroundColor: '#fafafa' }}
			bodyStyle={{ padding: '12px 8px' }}
		>
			<Row align="middle" justify="space-between" wrap={false}>
				<Col style={{ flex: 1, minWidth: 0 }}>
					<Space align="start">
						<FileTextOutlined
							style={{ fontSize: 25, color: '#1890ff', marginTop: 5 }}
						/>
						<div style={{ wordBreak: 'break-word' }}>
							<div>{file.fileName}</div>
							<Text type="secondary">
								{file.fileSize} • Uploaded on {file.uploadedAt}
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
	);
};

export default ThesisFileVersionCard;

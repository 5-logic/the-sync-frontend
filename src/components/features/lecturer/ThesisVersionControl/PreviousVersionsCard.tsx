import {
	DownOutlined,
	DownloadOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Dropdown,
	Menu,
	Row,
	Space,
	Typography,
} from 'antd';

import { ExtendedThesis } from '@/data/thesis';

const { Text, Title } = Typography;

interface Props {
	thesis: ExtendedThesis;
	versions: {
		version: string;
		fileName: string;
		fileSize: string;
		uploadedAt: string;
	}[];
}

const PreviousVersionsCard = ({ thesis, versions }: Props) => {
	const menu = (
		<Menu>
			{versions.map((v) => (
				<Menu.Item key={v.version}>Version {v.version}</Menu.Item>
			))}
		</Menu>
	);

	const latest = versions[0];

	return (
		<Card
			title={
				<Title level={5} style={{ margin: 0 }}>
					Previous Versions
				</Title>
			}
			extra={
				<Dropdown overlay={menu}>
					<a onClick={(e) => e.preventDefault()}>
						Version {latest.version} <DownOutlined />
					</a>
				</Dropdown>
			}
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
										<div>{latest.fileName}</div>
										<Text type="secondary">
											{latest.fileSize} • Uploaded on {latest.uploadedAt}
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
};

export default PreviousVersionsCard;

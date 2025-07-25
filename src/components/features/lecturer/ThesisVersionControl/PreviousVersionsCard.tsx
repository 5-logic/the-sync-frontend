import { DownOutlined } from '@ant-design/icons';
import { Button, Card, Col, Dropdown, Menu, Row, Typography } from 'antd';

import ThesisFileVersionCard from '@/components/features/lecturer/ThesisVersionControl/ThesisFileVersionCard';
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
					<Button type="link">
						Version {latest.version} <DownOutlined />
					</Button>
				</Dropdown>
			}
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
					<ThesisFileVersionCard file={latest} />
				</Col>
			</Row>
		</Card>
	);
};

export default PreviousVersionsCard;

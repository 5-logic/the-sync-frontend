'use client';

import {
	DownOutlined,
	DownloadOutlined,
	FilePdfOutlined,
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
import { useState } from 'react';

import { mockTheses } from '@/data/thesis';

const { Title, Text } = Typography;

const ThesisVersionControl = () => {
	const thesis = mockTheses[0];
	const [currentVersion] = useState({
		version: '3.0',
		fileName: 'thesis_proposal_v3.0.pdf',
		fileSize: '2.5 MB',
		uploadedAt: 'Jan 10, 2024',
	});

	const [previousVersions] = useState([
		{
			version: '2.0',
			fileName: 'thesis_proposal_v2.0.pdf',
			fileSize: '2.5 MB',
			uploadedAt: 'Jan 10, 2024',
		},
	]);

	const menu = (
		<Menu>
			{previousVersions.map((v) => (
				<Menu.Item key={v.version}>{`Version ${v.version}`}</Menu.Item>
			))}
		</Menu>
	);

	return (
		<div style={{ padding: 24 }}>
			<Title level={2}>Version Control</Title>
			<Row gutter={24}>
				{/* Current Version */}
				<Col span={12}>
					<Card
						title="Current Version"
						extra={<Text type="secondary">v{currentVersion.version}</Text>}
					>
						<div style={{ marginBottom: 12 }}>
							<Text strong>Thesis Title</Text>
							<div>{thesis.vietnameseName}</div>
						</div>
						<div style={{ marginBottom: 12 }}>
							<Text strong>Thesis Description</Text>
							<div>
								{
									'Development of an intelligent learning platform that utilizes artificial intelligence to personalize educational content and learning paths for university students. The system will incorporate machine learning algorithms for content recommendation, learning pattern analysis.'
								}
							</div>
						</div>
						<Card
							type="inner"
							style={{ backgroundColor: '#fafafa' }}
							bodyStyle={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
							}}
						>
							<Space>
								<FilePdfOutlined style={{ fontSize: 20 }} />
								<div>
									<div>{currentVersion.fileName}</div>
									<Text type="secondary">
										{currentVersion.fileSize} • Uploaded on{' '}
										{currentVersion.uploadedAt}
									</Text>
								</div>
							</Space>
							<Button icon={<DownloadOutlined />}>Download</Button>
						</Card>
					</Card>
				</Col>

				{/* Previous Versions */}
				<Col span={12}>
					<Card
						title="Previous Versions"
						extra={
							<Dropdown overlay={menu} trigger={['click']}>
								<a onClick={(e) => e.preventDefault()}>
									Version {previousVersions[0].version} <DownOutlined />
								</a>
							</Dropdown>
						}
					>
						<div style={{ marginBottom: 12 }}>
							<Text strong>Thesis Title</Text>
							<div>{thesis.vietnameseName}</div>
						</div>
						<div style={{ marginBottom: 12 }}>
							<Text strong>Thesis Description</Text>
							<div style={{ maxWidth: '100%' }}>
								{
									'Development of an intelligent learning platform that utilizes artificial intelligence to personalize educational content and learning paths for university students. The system will incorporate machine learning algorithms for content recommendation, learning pattern analysis, and adaptive assessment.'
								}
							</div>
						</div>
						<Card
							type="inner"
							style={{ backgroundColor: '#fafafa' }}
							bodyStyle={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
							}}
						>
							<Space>
								<FilePdfOutlined style={{ fontSize: 20 }} />
								<div>
									<div>{previousVersions[0].fileName}</div>
									<Text type="secondary">
										{previousVersions[0].fileSize} • Uploaded on{' '}
										{previousVersions[0].uploadedAt}
									</Text>
								</div>
							</Space>
							<Button icon={<DownloadOutlined />}>Download</Button>
						</Card>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default ThesisVersionControl;

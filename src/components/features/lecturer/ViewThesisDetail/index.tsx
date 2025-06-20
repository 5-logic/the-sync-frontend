'use client';

import {
	CheckOutlined,
	CloseOutlined,
	DownloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import Image from 'next/image';
import { useState } from 'react';

import ThesisDuplicateList from '@/components/features/lecturer/CreateThesis/ThesisDuplicateList';
import { mockTheses } from '@/data/thesis';

const { Title, Text, Paragraph } = Typography;

export default function ThesisDetailManagerPage() {
	const [showDuplicate, setShowDuplicate] = useState(false);

	const thesis = mockTheses.find((t) => t.id === 't1');
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Thesis Detail
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					View detail and manage Thesis, registration windows, and
					capstone-specific rules
				</Paragraph>
			</div>

			{thesis ? (
				<Card>
					<Title level={4}>{thesis.englishName}</Title>
					<Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
						<Tag color="blue">{thesis.domain}</Tag>
						<Tag color="orange">{thesis.status}</Tag>
						<Tag color="gold">Version {thesis.version}</Tag>
					</Space>

					<Row gutter={32} style={{ marginBottom: 16 }}>
						<Col span={12}>
							<Text strong>Vietnamese name</Text>
							<Paragraph>{thesis.vietnameseName}</Paragraph>
						</Col>
						<Col span={12}>
							<Text strong>Abbreviation</Text>
							<Paragraph>{thesis.abbreviation}</Paragraph>
						</Col>
					</Row>

					<div style={{ marginBottom: 16 }}>
						<Text strong>Description</Text>
						<Paragraph>{thesis.description}</Paragraph>
					</div>

					<div style={{ marginBottom: 16 }}>
						<Text strong>Required Skills</Text>
						<div style={{ marginTop: 8 }}>
							{thesis.skills.map((skill) => (
								<Tag key={skill}>{skill}</Tag>
							))}
						</div>
					</div>

					<Button icon={<DownloadOutlined />} style={{ marginBottom: 24 }}>
						Download Supporting Document
					</Button>

					<div style={{ marginBottom: 24 }}>
						<Text strong>Supervisor Information</Text>
						<Card size="small" style={{ marginTop: 8 }}>
							<Space>
								<Image
									src="/images/user_avatar.png"
									alt="Supervisor Avatar"
									width={48}
									height={48}
									style={{ borderRadius: '50%' }}
								/>
								<div>
									<Text strong>{thesis.supervisor?.name}</Text>
									<Paragraph style={{ marginBottom: 0 }}>
										{thesis.supervisor?.phone}
									</Paragraph>
									<Paragraph style={{ marginBottom: 0 }} type="secondary">
										{thesis.supervisor?.email}
									</Paragraph>
								</div>
							</Space>
						</Card>
					</div>
				</Card>
			) : (
				<Card>
					<Title level={4}>Thesis not found</Title>
					<Paragraph>The requested thesis could not be found.</Paragraph>
				</Card>
			)}

			{/* Action Buttons */}
			<Row justify="space-between">
				<Col>
					<Button
						icon={<SearchOutlined />}
						onClick={() => setShowDuplicate(!showDuplicate)}
						type="primary"
					>
						Duplicate Thesis Detection
					</Button>
				</Col>
				<Col>
					<Space>
						<Button>Exit</Button>
						<Button danger icon={<CloseOutlined />}>
							Reject
						</Button>
						<Button type="primary" icon={<CheckOutlined />}>
							Approve
						</Button>
					</Space>
				</Col>
			</Row>
			{showDuplicate && <ThesisDuplicateList />}
		</Space>
	);
}

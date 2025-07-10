import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Row, Space, Tag, Typography } from 'antd';

import studentProfile from '@/data/studentProfile';

const { Title, Text } = Typography;

export default function StudentProfileLayout() {
	const data = studentProfile;

	return (
		<Card bordered style={{ marginTop: 24 }} bodyStyle={{ padding: 24 }}>
			<Row gutter={[24, 24]} align="top">
				<Col xs={24} md={12}>
					<Space direction="vertical" size="middle">
						<Title level={4}>{data.fullName}</Title>
						<Text type="secondary">ID: {data.studentCode}</Text>
						<Text type="secondary">Major: {data.major}</Text>
						<Text>
							<MailOutlined /> {data.email}
						</Text>
						<Text>
							<PhoneOutlined /> {data.phoneNumber}
						</Text>
						<Text>Gender: {data.gender}</Text>
						<Text>Roles: {data.roles.join(', ')}</Text>
					</Space>
				</Col>

				<Col xs={24} md={12}>
					<Divider orientation="left">Skills</Divider>
					<Space wrap>
						{data.skills.map((skill) => (
							<Tag key={skill} color="blue">
								{skill}
							</Tag>
						))}
					</Space>
				</Col>
			</Row>
		</Card>
	);
}

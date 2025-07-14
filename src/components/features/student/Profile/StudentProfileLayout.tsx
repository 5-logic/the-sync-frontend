import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Row, Space, Typography } from 'antd';

import studentProfile from '@/data/studentProfile';

const { Title, Text } = Typography;

export default function StudentProfileLayout() {
	const data = studentProfile;

	return (
		<Card bordered bodyStyle={{ padding: 24 }}>
			<Row gutter={[24, 24]} align="middle">
				<Col span={24}>
					<Row gutter={[16, 16]} align="middle">
						<Col>
							<Avatar size={96} icon={<UserOutlined />} />
						</Col>
						<Col>
							<Space direction="vertical" size={2}>
								<Title level={5} style={{ margin: 0 }}>
									{data.fullName}
								</Title>
								<Text type="secondary">ID: {data.studentCode}</Text>
								<Text type="secondary">{data.major}</Text>
							</Space>
						</Col>
					</Row>
				</Col>

				<Col span={24}>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Text type="secondary">
								<MailOutlined /> Email
							</Text>
							<br />
							<Text strong>{data.email}</Text>
						</Col>
						<Col xs={24} sm={12}>
							<Text type="secondary">
								<PhoneOutlined /> Phone
							</Text>
							<br />
							<Text strong>{data.phoneNumber}</Text>
						</Col>
					</Row>
				</Col>

				<Col span={24}>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Text type="secondary">Gender</Text>
							<br />
							<Text strong>{data.gender}</Text>
						</Col>
						<Col xs={24} sm={12}>
							<Text type="secondary">Roles</Text>
							<br />
							<Text strong>{data.roles.join(', ')}</Text>
						</Col>
					</Row>
				</Col>
			</Row>
		</Card>
	);
}

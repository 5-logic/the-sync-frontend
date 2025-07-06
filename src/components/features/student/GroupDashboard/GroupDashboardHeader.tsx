import { Col, Row, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function GroupDashboardHeader() {
	return (
		<Row justify="space-between" align="middle">
			<Col>
				<Title level={2} style={{ marginBottom: 4 }}>
					Group Dashboard
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					View your group information, members, project details, and thesis
					progress.
				</Paragraph>
			</Col>
		</Row>
	);
}

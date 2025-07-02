import { Space, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function ThesisHeader() {
	return (
		<Space direction="vertical" size={0}>
			<Title level={2} style={{ marginBottom: '4px' }}>
				Thesis Detail
			</Title>
			<Paragraph type="secondary" style={{ marginBottom: 0 }}>
				View comprehensive thesis information, supervisor details, and manage
				approval status
			</Paragraph>
		</Space>
	);
}

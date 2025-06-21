import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function ThesisHeader() {
	return (
		<div style={{ marginBottom: 24 }}>
			<Title level={2} style={{ marginBottom: '4px' }}>
				Thesis Detail
			</Title>
			<Paragraph type="secondary" style={{ marginBottom: 0 }}>
				View detail and manage Thesis, registration windows, and
				capstone-specific rules
			</Paragraph>
		</div>
	);
}

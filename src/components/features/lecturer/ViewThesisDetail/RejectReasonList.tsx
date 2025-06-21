import { Typography } from 'antd';

const { Text } = Typography;

interface Props {
	reasons: string[];
	show?: boolean;
}

export default function RejectReasonList({ reasons, show = false }: Props) {
	if (!show || !reasons.length) return null;

	return (
		<div style={{ marginBottom: 24 }}>
			<Text strong>Reject Reasons</Text>
			<ul style={{ marginTop: 8, paddingLeft: 20 }}>
				{reasons.map((reason, index) => (
					<li key={index}>
						<Text>{reason}</Text>
					</li>
				))}
			</ul>
		</div>
	);
}

import { Typography } from 'antd';

const { Text } = Typography;

interface Props {
	readonly reasons: string[];
	readonly show?: boolean;
}

export default function RejectReasonList({ reasons, show = false }: Props) {
	if (!show || !reasons.length) return null;

	return (
		<div style={{ marginBottom: 24 }}>
			<Text strong>Reject Reasons</Text>
			<ul style={{ marginTop: 8, paddingLeft: 20 }}>
				{reasons.map((reason) => (
					<li key={reason}>
						<Text>{reason}</Text>
					</li>
				))}
			</ul>
		</div>
	);
}

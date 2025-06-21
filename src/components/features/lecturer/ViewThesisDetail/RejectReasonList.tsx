import { Typography } from 'antd';

import { FormLabel } from '@/components/common/FormLabel';

const { Text } = Typography;

interface Props {
	readonly reasons: string[];
	readonly show?: boolean;
}

export default function RejectReasonList({ reasons, show = false }: Props) {
	if (!show || !reasons.length) return null;

	return (
		<div style={{ marginBottom: 24 }}>
			<FormLabel text="Reject Reasons" isRequired isBold />
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

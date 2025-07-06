import { Card, Empty, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function NoThesisCard() {
	return (
		<Card>
			<Empty
				image={Empty.PRESENTED_IMAGE_SIMPLE}
				description={
					<div className="text-center">
						<Title level={4}>No Thesis Selected</Title>
						<Paragraph type="secondary">
							Your group hasn&apos;t selected a thesis yet. Please wait for the
							thesis selection phase to begin.
						</Paragraph>
					</div>
				}
			/>
		</Card>
	);
}

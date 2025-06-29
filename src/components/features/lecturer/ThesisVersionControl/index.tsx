'use client';

import { Col, Row, Typography } from 'antd';

import CurrentVersionCard from '@/components/features/lecturer/ThesisVersionControl/CurrentVersionCard';
import PreviousVersionsCard from '@/components/features/lecturer/ThesisVersionControl/PreviousVersionsCard';
import { currentVersion, mockTheses, previousVersions } from '@/data/thesis';

const { Title, Paragraph } = Typography;

const ThesisVersionControl = () => {
	const thesis = mockTheses[0];

	return (
		<div style={{ padding: 24 }}>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Thesis Version Control
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 24 }}>
					Track and manage project updates, ensuring progress and clear revision
					history
				</Paragraph>
			</div>

			<Row gutter={[16, 16]}>
				<Col xs={24} md={12}>
					<CurrentVersionCard thesis={thesis} versionData={currentVersion} />
				</Col>
				<Col xs={24} md={12}>
					<PreviousVersionsCard thesis={thesis} versions={previousVersions} />
				</Col>
			</Row>
		</div>
	);
};

export default ThesisVersionControl;

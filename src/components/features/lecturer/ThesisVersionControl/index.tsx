'use client';

import { Col, Row } from 'antd';

import { Header } from '@/components/common/Header';
import CurrentVersionCard from '@/components/features/lecturer/ThesisVersionControl/CurrentVersionCard';
import PreviousVersionsCard from '@/components/features/lecturer/ThesisVersionControl/PreviousVersionsCard';
import { currentVersion, mockTheses, previousVersions } from '@/data/thesis';

const ThesisVersionControl = () => {
	const thesis = mockTheses[0];

	return (
		<div style={{ padding: 24 }}>
			<Header
				title="Thesis Version Control"
				description="Track and manage project updates, ensuring progress and clear revision
					history."
			/>

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

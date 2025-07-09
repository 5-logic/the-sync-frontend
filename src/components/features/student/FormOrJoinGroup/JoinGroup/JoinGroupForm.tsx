import { Button, Col, Form, Row, Select, TreeSelect } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useResponsibilityStore } from '@/store/useResponsibilityStore';
import { useSkillSetStore } from '@/store/useSkillSetStore';

const FORM_CONFIG = {
	TREE_SELECT_MAX_HEIGHT: 400,
	BUTTON_HEIGHT: 40,
	BUTTON_MIN_WIDTH: 120,
	BUTTON_FONT_SIZE: 14,
} as const;

const BUTTON_STYLES = {
	marginTop: 16,
	minWidth: FORM_CONFIG.BUTTON_MIN_WIDTH,
	fontSize: FORM_CONFIG.BUTTON_FONT_SIZE,
	height: FORM_CONFIG.BUTTON_HEIGHT,
	padding: '0 16px',
	whiteSpace: 'nowrap' as const,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
} as const;

interface FormValues {
	readonly skills: string[];
	readonly responsibility?: string[];
}

export default function JoinGroupForm() {
	// Fetch data from stores
	const { skillSets, fetchSkillSets } = useSkillSetStore();
	const { responsibilities, fetchResponsibilities } = useResponsibilityStore();

	// Fetch data on component mount
	useEffect(() => {
		fetchSkillSets();
		fetchResponsibilities();
	}, [fetchSkillSets, fetchResponsibilities]);

	// Build responsibility options from API data
	const responsibilityOptions = useMemo(
		() =>
			responsibilities.map((responsibility) => ({
				value: responsibility.id,
				label: responsibility.name,
			})),
		[responsibilities],
	);

	// Build skill tree data from API data
	const skillTreeData = useMemo(() => {
		return skillSets.map((skillSet) => ({
			value: skillSet.id,
			title: skillSet.name,
			selectable: false,
			children: skillSet.skills.map((skill) => ({
				value: skill.id,
				title: skill.name,
			})),
		}));
	}, [skillSets]);

	const handleFinish = useCallback((values: FormValues) => {
		console.log('Suggest group values:', values);
	}, []);

	return (
		<Form layout="vertical" requiredMark={false} onFinish={handleFinish}>
			<Row gutter={[16, 16]}>
				<Col xs={24} md={12}>
					<Form.Item
						name="skills"
						label={<FormLabel text="Skills" isBold />}
						style={{ marginBottom: 0 }}
					>
						<TreeSelect
							treeData={skillTreeData}
							placeholder="Select skills"
							showSearch
							multiple
							allowClear
							treeCheckable={false}
							showCheckedStrategy={TreeSelect.SHOW_CHILD}
							style={{ width: '100%' }}
							dropdownStyle={{
								maxHeight: FORM_CONFIG.TREE_SELECT_MAX_HEIGHT,
								overflow: 'auto',
							}}
						/>
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="responsibility"
						label={<FormLabel text="Responsibility" isBold />}
						style={{ marginBottom: 0 }}
					>
						<Select
							mode="multiple"
							options={responsibilityOptions}
							placeholder="Select responsibility"
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col>
					<Button type="primary" htmlType="submit" style={BUTTON_STYLES}>
						Suggest Groups
					</Button>
				</Col>
			</Row>
		</Form>
	);
}

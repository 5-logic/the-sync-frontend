import { Col, Form, Input, Row, Select } from "antd";
import { memo, useMemo } from "react";

import { FormLabel } from "@/components/common/FormLabel";
import { THESIS_DOMAINS } from "@/lib/constants/domains";

// Constants for better maintainability
const VALIDATION_RULES = {
	GROUP_NAME: {
		MIN_LENGTH: 3,
		MAX_LENGTH: 50,
	},
} as const;

function GroupFormFields() {
	// Project areas from constants
	const projectAreas = useMemo(
		() =>
			THESIS_DOMAINS.map((domain) => ({
				value: domain,
				label: domain,
			})),
		[],
	);

	// Memoize group name rules to prevent re-creation on every render
	const getGroupNameRules = useMemo(
		() => [
			{ required: true, message: "Please enter group name" },
			{
				min: VALIDATION_RULES.GROUP_NAME.MIN_LENGTH,
				message: `Group name must be at least ${VALIDATION_RULES.GROUP_NAME.MIN_LENGTH} characters`,
			},
			{
				max: VALIDATION_RULES.GROUP_NAME.MAX_LENGTH,
				message: `Group name must be less than ${VALIDATION_RULES.GROUP_NAME.MAX_LENGTH} characters`,
			},
		],
		[],
	);

	return (
		<Row gutter={[16, 16]}>
			<Col xs={24} md={12}>
				<Form.Item
					name="name"
					label={<FormLabel text="Group Name" isBold isRequired />}
					rules={getGroupNameRules}
				>
					<Input placeholder="Enter group name" />
				</Form.Item>
			</Col>
			<Col xs={24} md={12}>
				<Form.Item
					name="area"
					label={<FormLabel text="Project Direction or Area" isBold />}
				>
					<Select
						options={projectAreas}
						placeholder="Select project area"
						allowClear
						showSearch
						filterOption={(input, option) =>
							(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
						}
					/>
				</Form.Item>
			</Col>
		</Row>
	);
}

export default memo(GroupFormFields);

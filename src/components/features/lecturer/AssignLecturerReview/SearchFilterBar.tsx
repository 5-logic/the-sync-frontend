import { Input, Select, Space } from 'antd';

export default function SearchFilterBar() {
	return (
		<Space wrap>
			<Select placeholder="Select Semester" style={{ width: 180 }} />
			<Select placeholder="Select Milestone" style={{ width: 180 }} />
			<Input.Search placeholder="Search groups" style={{ width: 240 }} />
		</Space>
	);
}

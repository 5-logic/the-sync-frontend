'use client';

import { Button, DatePicker, Input, Select } from 'antd';
import { useState } from 'react';

import { initialMilestoneData } from '@/data/mileStone';
import { Milestone } from '@/types/milestone';

import MilestoneTable from './MilestoneTable';

const { RangePicker } = DatePicker;

export default function MilestoneManagement() {
	const [data] = useState<Milestone[]>(initialMilestoneData);

	return (
		<div className="px-4 py-4 sm:px-6 lg:px-8">
			<h2 className="text-2xl font-semibold mb-6">Milestones Management</h2>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow mb-6">
				<div>
					<label className="block text-sm font-medium mb-1">
						Milestone Name<span className="text-red-500">*</span>
					</label>
					<Input placeholder="Enter milestone name" />
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">
						Semester<span className="text-red-500">*</span>
					</label>
					<Select
						placeholder="Select semester"
						options={[
							{ value: 'Fall 2023', label: 'Fall 2023' },
							{ value: 'Spring 2024', label: 'Spring 2024' },
						]}
						className="w-full"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">
						Duration<span className="text-red-500">*</span>
					</label>
					<RangePicker className="w-full" />
				</div>
				<div className="md:col-span-3 text-right">
					<Button type="primary">+ Create New Milestone</Button>
				</div>
			</div>

			<MilestoneTable data={data} />
		</div>
	);
}

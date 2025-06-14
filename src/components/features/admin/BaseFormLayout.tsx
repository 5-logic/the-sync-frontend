'use client';

import { ReactNode, useState } from 'react';

import TabNavigation from './TabNavigation';

type Props = {
	pageTitle: string;
	description: string;
	ManualForm: ReactNode;
	ExcelPlaceholder?: ReactNode;
};

const BaseFormLayout = ({
	pageTitle,
	description,
	ManualForm,
	ExcelPlaceholder,
}: Props) => {
	const [activeTab, setActiveTab] = useState('manual');

	return (
		<div className="flex justify-center items-start min-h-screen px-4">
			<div className="w-full max-w-3xl">
				<div className="mb-8 -ml-8 text-left">
					<h1 className="text-3xl font-bold">{pageTitle}</h1>
					<p className="text-gray-500">{description}</p>
				</div>

				<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

				{activeTab === 'manual' ? (
					<div className="bg-white border border-gray-200 rounded-xl shadow p-10">
						{ManualForm}
					</div>
				) : (
					<div className="bg-white p-6 rounded-lg shadow">
						{ExcelPlaceholder || (
							<p className="text-gray-600">
								Excel import functionality coming soon...
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default BaseFormLayout;

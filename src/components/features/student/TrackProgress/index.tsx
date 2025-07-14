import MilestoneDetailCard from './MilestoneDetailCard';
import MilestoneStep from './MilestoneStep';
import ProgressOverviewCard from './ProgressOverviewCard';

export default function ProjectProgressPage() {
	return (
		<div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div className="lg:col-span-2">
				<MilestoneStep />
				<MilestoneDetailCard />
			</div>
			<div>
				<ProgressOverviewCard />
			</div>
		</div>
	);
}

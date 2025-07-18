import { redirect } from 'next/navigation';

export default function ChecklistEditRedirectPage() {
	// This page is now deprecated - redirect to use the new [id] dynamic route
	redirect('/lecturer/checklist-management');
}

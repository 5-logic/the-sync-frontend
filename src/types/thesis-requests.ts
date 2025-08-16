import { ThesisOrientation } from "@/schemas/_enums";

// Types for the new thesis requests API structure
export interface ThesisRequest {
	groupId: string;
	thesisId: string;
	status: "Pending" | "Approved" | "Rejected";
	createdAt: string;
	updatedAt: string;
	group: {
		id: string;
		code: string;
		name: string;
		projectDirection: string | null;
		semesterId: string;
		thesisId: string | null;
		createdAt: string;
		updatedAt: string;
		semester: {
			id: string;
			name: string;
			code: string;
			status: string;
			ongoingPhase: string | null;
			defaultThesesPerLecturer: number;
			maxThesesPerLecturer: number;
			createdAt: string;
			updatedAt: string;
		};
		studentGroupParticipations: Array<{
			studentId: string;
			groupId: string;
			semesterId: string;
			isLeader: boolean;
			student: {
				userId: string;
				studentCode: string;
				majorId: string;
				user: {
					id: string;
					fullName: string;
					email: string;
					gender: string;
					phoneNumber: string;
					isActive: boolean;
					createdAt: string;
					updatedAt: string;
				};
				major: {
					id: string;
					name: string;
					code: string;
					createdAt: string;
					updatedAt: string;
				};
			};
		}>;
	};
}

export interface ThesisWithRequests {
	thesis: {
		id: string;
		englishName: string;
		vietnameseName: string;
		abbreviation: string;
		description: string;
		orientation: ThesisOrientation;
		domain: string;
		status: string;
		isPublish: boolean;
		createdAt: string;
		updatedAt: string;
		lecturer: {
			userId: string;
			isModerator: boolean;
			user: {
				id: string;
				fullName: string;
				email: string;
				gender: string;
				phoneNumber: string;
				isActive: boolean;
				createdAt: string;
				updatedAt: string;
			};
		};
		semester: {
			id: string;
			name: string;
			code: string;
			status: string;
			ongoingPhase: string | null;
			defaultThesesPerLecturer: number;
			maxThesesPerLecturer: number;
			createdAt: string;
			updatedAt: string;
		};
	};
	requests: ThesisRequest[];
}

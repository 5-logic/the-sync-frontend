import { Student } from './student';

export interface Major {
	id: string;
	name: string;
	code: string;
	students?: Student[];
}

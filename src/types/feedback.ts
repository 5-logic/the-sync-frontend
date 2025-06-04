import { Lecturer } from './lecturer';
import { TrackingDetail } from './trackingDetail';

export interface Feedback {
	trackingDetailId: string;
	lecturerId: string;
	detail: string;

	trackingDetail?: TrackingDetail;
	lecturer?: Lecturer;
}

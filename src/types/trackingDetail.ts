import { Feedback } from "./feedback";
import { Group } from "./group";
import { Milestone } from "./milestone";


export interface TrackingDetail {
  id: string;
  documents?: unknown;
  groupId: string;
  milestoneId: string;

  group?: Group;
  milestone?: Milestone;
  feedbacks?: Feedback[];
}

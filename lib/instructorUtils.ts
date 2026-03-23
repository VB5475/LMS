import { Instructor } from "../types";

export function getInstructorName(instructor?: Instructor): string {
 if (!instructor) return "Unknown Instructor";

 if (instructor.firstName && instructor.lastName) {
  return `${instructor.firstName} ${instructor.lastName}`;
 }

 if (instructor.name?.first && instructor.name?.last) {
  return `${instructor.name.first} ${instructor.name.last}`;
 }

 if (instructor.username) return instructor.username;

 return "Unknown Instructor";
}

export function getInstructorAvatar(instructor?: Instructor): string | null {
 if (!instructor) return null;

 if (instructor.avatar && instructor.avatar.startsWith("http")) {
  return instructor.avatar;
 }

 if (instructor.picture?.medium) return instructor.picture.medium;
 if (instructor.picture?.large) return instructor.picture.large;

 return null;
}

export function getInstructorInitial(instructor?: Instructor): string {
 const name = getInstructorName(instructor);
 return name.charAt(0).toUpperCase();
}

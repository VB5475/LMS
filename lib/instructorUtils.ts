import { Instructor } from "../types";

// freeapi randomusers can return either firstName/lastName
// or name.first/name.last depending on the endpoint version
export function getInstructorName(instructor?: Instructor): string {
 if (!instructor) return "Unknown Instructor";

 // try firstName/lastName first
 if (instructor.firstName && instructor.lastName) {
  return `${instructor.firstName} ${instructor.lastName}`;
 }

 // try name.first/name.last
 if (instructor.name?.first && instructor.name?.last) {
  return `${instructor.name.first} ${instructor.name.last}`;
 }

 // fallback to username
 if (instructor.username) return instructor.username;

 return "Unknown Instructor";
}

export function getInstructorAvatar(instructor?: Instructor): string | null {
 if (!instructor) return null;

 // direct avatar string
 if (instructor.avatar && instructor.avatar.startsWith("http")) {
  return instructor.avatar;
 }

 // picture object from randomusers
 if (instructor.picture?.medium) return instructor.picture.medium;
 if (instructor.picture?.large) return instructor.picture.large;

 return null;
}

export function getInstructorInitial(instructor?: Instructor): string {
 const name = getInstructorName(instructor);
 return name.charAt(0).toUpperCase();
}

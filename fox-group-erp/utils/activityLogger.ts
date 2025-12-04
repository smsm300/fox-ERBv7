import { ActivityLogEntry, User } from '../types';

export const createActivityLog = (
  currentUser: User,
  action: string,
  details: string
): ActivityLogEntry => {
  return {
    id: Date.now(),
    date: new Date().toISOString(),
    userId: currentUser.id,
    userName: currentUser.name,
    action,
    details
  };
};


export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    nextCursor: string | undefined;
    limit: number;
    hasNext: boolean;
  };
}

export interface count {
  notificationCount:number
}
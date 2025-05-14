export interface Person {
  id: string;
  name: string;
  votes: number;
  bio?: string;
  joke?: string;
  ipAddress?: string;
  lastVoterIp?: string;
  friends?: string[]; // array of Person ids who are friends
  friendRequestsSent?: string[]; // array of Person ids to whom requests were sent
  friendRequestsReceived?: string[]; // array of Person ids from whom requests were received
} 
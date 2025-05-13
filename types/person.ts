export interface Person {
  id: string;
  name: string;
  votes: number;
  bio?: string;
  joke?: string;
  ipAddress?: string;
  lastVoterIp?: string;
}
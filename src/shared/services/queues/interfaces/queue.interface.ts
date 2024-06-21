export interface IQueue {
  type: string;
  name: string;
  hostId: string;
  redis: {
    port: number;
    host: string;
    password: string;
  };
}

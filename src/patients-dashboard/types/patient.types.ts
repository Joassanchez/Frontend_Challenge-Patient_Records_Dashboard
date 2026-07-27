export interface Patient {
  id: string;
  name: string;
  description: string;
  website: string;
  avatar: string;
  createdAt?: string;
  /** Injected by the store — NOT parsed from API responses. */
  _origin?: 'api' | 'local';
  /** Optional status — defaults to 'active' for API patients. */
  status?: 'active' | 'inactive';
}

export interface Patient {
  id: string;
  name: string;
  description: string;
  webpage: string;
  avatar: string;
  createdAt?: string;
}

export interface UserDto {
  id: string;
  name: string;
  description: string;
  website: string;
  avatar: string;
  createdAt?: string;
}

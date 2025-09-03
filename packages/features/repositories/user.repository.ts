export interface UserRepository {
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    name: string | null;
    password: string | null;
    roles: string[];
  } | null>;
}
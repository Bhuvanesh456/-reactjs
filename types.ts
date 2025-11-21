export interface Company {
  name: string;
  catchPhrase?: string;
  bs?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: Company;
  // Fields from API that we might not use in the table but exist on the object
  username?: string;
  website?: string;
  address?: any;
}
interface Auth0User {
  sub: string;
  name?: string;
  nickname?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

export default Auth0User;

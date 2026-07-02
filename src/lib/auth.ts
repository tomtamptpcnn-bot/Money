export const authCookieName = "moneytomtam_session";

export function authConfig() {
  return {
    sessionSecret: process.env.APP_SESSION_SECRET ?? ""
  };
}

export function authConfigured() {
  const config = authConfig();
  return Boolean(config.sessionSecret);
}

export function validSession(value?: string) {
  const config = authConfig();
  return authConfigured() && value === config.sessionSecret;
}

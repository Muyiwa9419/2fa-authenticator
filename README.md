2fa-authenticator is two-factor authentication app
User can register with username and password(password is hashed for security reasons)
User can login upon registration,
User can check status if user is logged in or not,
User can logout
User can setup two-factor authentication,
User can verify identity,
User can reset password with endpoints well handled and other cool features.
ROUTES ARE: 
POST: api/auth/register,
POST: api/auth/login,
GET: api/auth/status,
POST: api/auth/logout
POST: api/auth/2fa/setup,
POST: api/auth/2fa/verify,
POST: api/auth/2fa/reset

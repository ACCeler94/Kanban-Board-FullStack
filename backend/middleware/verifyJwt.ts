import { GetVerificationKey, expressjwt as jwt } from 'express-jwt';
import jwks from 'jwks-rsa';

const verifyJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: 'https://acceler945.eu.auth0.com/',
  algorithms: ['RS256'],
});

export default verifyJwt;

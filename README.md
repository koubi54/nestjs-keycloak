# NestJS + Keycloak authentication

Local setup to test JWT authentication with **Keycloak** and **NestJS**.

## Prerequisites

- Docker & Docker Compose
- Node.js 18+

## 1. Start Keycloak

```bash
docker compose up -d
```

Admin console: [http://localhost:8080](http://localhost:8080)

| Field    | Value  |
|----------|--------|
| Username | `admin` |
| Password | `admin` |

Pre-imported realm: **`nestjs-app`**

### Test users

| Username    | Password   | Roles        |
|-------------|------------|--------------|
| `testuser`  | `password` | `user`       |
| `adminuser` | `password` | `user`, `admin` |

### Clients

| Client ID          | Type     | Secret                   |
|--------------------|----------|--------------------------|
| `nestjs-backend`   | confidential | `nestjs-backend-secret` |
| `nestjs-frontend`  | public   | —                        |

## 2. Start NestJS

```bash
cd nestjs-app
npm install
npm run start:dev
```

API: [http://localhost:3000](http://localhost:3000)

## 3. Login via NestJS & call protected routes

### Get access token (NestJS proxies Keycloak)

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}'
```

Save the token:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}' \
  | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
```

### Refresh token

```bash
curl -s -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

### Call protected routes

```bash
# Public
curl http://localhost:3000/

# Profile (any authenticated user)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/auth/profile

# Admin only
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"adminuser","password":"password"}' \
  | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/auth/admin
```

## 4. Postman

Import into Postman:

1. `postman/NestJS-Keycloak.postman_collection.json`
2. `postman/Local.postman_environment.json`
3. Select environment **Local**
4. Run **Auth → Login**, then **Protected → Get Profile**

Git-native v3 files also live under `postman/collections/` and `postman/environments/`.

## Project layout

```
├── docker-compose.yml          # Keycloak container
├── keycloak/realm-export.json  # Preconfigured realm, users, clients
├── nestjs-app/                 # NestJS API (login + JWT validation)
└── postman/                    # Collection + Local environment
```


## How auth works

1. `POST /auth/login` sends credentials to NestJS; NestJS asks Keycloak for a JWT.
2. NestJS validates JWTs using Keycloak JWKS (`/realms/nestjs-app/protocol/openid-connect/certs`).
3. `JwtAuthGuard` protects routes; `RolesGuard` checks realm roles.

## Stop Keycloak

```bash
docker compose down
# Remove volume too:
docker compose down -v
```

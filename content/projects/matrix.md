+++
title = 'Matrix Server'
date = 2026-03-11T08:28:28Z
draft = false
image = "/img/matrix-logo.png"
+++

# Synapse Matrix Server Configuration

Recently I set up a Matrix homeserver on my personal infrastructure, using Caddy as a reverse proxy and Postgres as the database backend. There are other examples on the internet; these are just my two cents.

## Synapse

The Matrix server I used is Synapse. The container requires three volumes:

- `/data` stores runtime data, media uploads, and the signing key.
- `/var/lib/synapse` provides a dedicated library path.
- `homeserver.yaml` is bind-mounted read-only from the host.

To avoid permissions errors, I set the user's UID to the same UID that will start the service. The ports are exposed instead of published since the host does not need to use them; they only need to be available to Caddy.

**docker-compose.yaml**

```yaml
services:
  synapse:
    image: matrixdotorg/synapse:latest
    container_name: synapse
    restart: unless-stopped
    user: "1000:1000"
    expose:
      - "8008:8008"
    volumes:
      - ${VOLUME_PATH}/synapse/data:/data
      - ${VOLUME_PATH}/synapse/synapse:/var/lib/synapse
      - ./homeserver.yaml:/data/homeserver.yaml
    depends_on:
      - postgres
```

### Synapse Configuration

Server identity: the `server_name` is the root domain, not the subdomain. This means user IDs appear as `@user:example.org` rather than `@user:matrix.example.org`. The `serve_server_wellknown` option tells Synapse to handle well-known requests internally as a fallback.

**homeserver.yaml**

```yaml
server_name: "example.org"
serve_server_wellknown: true
```

The listener binds to all interfaces on port 8008 without TLS (`tls: false`). TLS termination happens at Caddy. The bind address needs to be `0.0.0.0` because the service will be listening on the Docker container port `8008`.

**homeserver.yaml**

```yaml
listeners:
  - bind_addresses:
      - "0.0.0.0"
    port: 8008
    resources:
      - compress: false
        names:
          - client
          - federation
    tls: false
    type: http
    x_forwarded: true
```

The environment variables defined here are not handled by Docker. Instead, a Python script managed by [PyInfra](https://pyinfra.com/) will replace the variables with the right values before the files are pushed to the remote server.

**homeserver.yaml**

```yaml
database:
  name: psycopg2
  args:
    user: ${SYNAPSE_USER}
    password: ${SYNAPSE_PASSWORD}
    database: ${SYNAPSE_DB}
    host: postgres
    port: 5432
    cp_min: 5
    cp_max: 10
```

The same principle applies to other secrets.

**homeserver.yaml**

```yaml
enable_registration: false
registration_shared_secret: "${REGISTRATION_SHARED_SECRET}"
macaroon_secret_key: "${MACAROON_SECRET_KEY}"
form_secret: "${FORM_SECRET}"
signing_key_path: "/data/example.org.signing.key"
```

## PostgreSQL Service

This was a bit trickier. I experienced some problems with collation and locales, so I pinned to a Debian-based image and wrote an init script that would set up the database for Synapse.

**docker-compose.yaml**

```yaml
postgres:
  image: postgres:18-trixie
  container_name: synapse-postgres
  restart: unless-stopped
  volumes:
    - ${VOLUME_PATH}/postgres/data:/var/lib/postgresql
    - ./postgres-init.sh:/docker-entrypoint-initdb.d/init.sh:ro
  env_file:
    - .env
  environment:
    - SYNAPSE_DB
    - SYNAPSE_USER
    - SYNAPSE_PASSWORD
    - POSTGRES_PASSWORD
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U synapse"]
    interval: 10s
    timeout: 5s
    retries: 5
```

**docker-entrypoint-initdb.d/init.sh**

```bash
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
  CREATE USER "$SYNAPSE_USER" WITH PASSWORD '$SYNAPSE_PASSWORD';
  CREATE DATABASE "$SYNAPSE_DB" WITH OWNER="$SYNAPSE_USER" ENCODING='UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;
EOSQL
```

## Caddy Service

**docker-compose.yaml**

```yaml
caddy:
  image: caddy:2-alpine
  container_name: synapse-caddy
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile:ro
    - ${VOLUME_PATH}/caddy/data:/data
    - ${VOLUME_PATH}/caddy/config:/config
  env_file:
    - .env
  depends_on:
    - synapse
  command: caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
```

## Caddyfile Routing

The Caddy configuration handles two domains: the root domain for well-known delegation and the Matrix subdomain for actual traffic. The redirection is done to the Docker name instead of the host's port.

**Caddyfile**

```
example.org {
    header /.well-known/matrix/* Content-Type application/json
    header /.well-known/matrix/* Access-Control-Allow-Origin *
    respond /.well-known/matrix/server `{"m.server": "matrix.example.org:443"}`
    respond /.well-known/matrix/client `{"m.homeserver":{"base_url":"https://matrix.example.org"},"m.identity_server":{"base_url":"https://identity.example.org"}}`
}

matrix.example.org {
    reverse_proxy /_matrix/* synapse:8008
    reverse_proxy /_synapse/client/* synapse:8008
}
```

## DNS Requirements

The configuration requires DNS records that match the Caddyfile setup:

- An A record for `example.org` pointing to the server IP
- An A record for `matrix.example.org` pointing to the same IP

## Final notes

To deploy the Matrix service I used two technologies that I'm getting familiar with:

- [Terraform](https://developer.hashicorp.com/terraform), used to generate resources like a remote server on my cloud provider and the DNS entries.
- [PyInfra](https://pyinfra.com/), an Ansible-like tool used to provision the server with the `docker-compose.yaml`, the configuration files, and the secrets substitution.

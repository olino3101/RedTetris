export DOMAIN_NAME=${shell hostname}
export HTTPS_PORT=4243

# Running containers attached
dev:
	docker compose -f docker-compose.dev.yml up --build

prod:
	docker compose -f docker-compose.prod.yml up --build

caddy-fmt:
	docker run --rm -v "./caddy:/etc/caddy" caddy:2.7-alpine sh -c 'caddy fmt -w /etc/caddy/Caddyfile.dev && caddy fmt -w /etc/caddy/Caddyfile.prod'


# Running containers detached
dev-d:
	docker compose -f docker-compose.dev.yml up --build -d

prod-d:
	docker compose -f docker-compose.prod.yml up --build -d


# Server down
down:
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.prod.yml down

dev-down:
	docker compose -f docker-compose.dev.yml down

prod-down:
	docker compose -f docker-compose.prod.yml down

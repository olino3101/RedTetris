export DOMAIN_NAME=${shell hostname}
export HTTPS_PORT=4243

prod:
	docker compose up --build

down:
	docker compose down -v

re: down prod


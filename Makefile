# Load environment variables from .env
include .env
CURRENT_DIR := $(CURDIR)

# Make a snapshot of the remote database
db/snapshot:
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		-v "$(CURRENT_DIR)":/backups \
		postgres:16 \
		pg_dump -h $(REMOTE_DB_HOST) -p $(DB_PORT) -U $(DB_USER) -F c -b -v -f /backups/db_snapshot.dump $(DB_NAME)

# Restore into local DB using Dockerized pg_restore
db/restore:
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		-v "$(CURRENT_DIR)":/backups \
		postgres:16 \
		pg_restore --no-owner --no-privileges -h localhost -p $(DB_PORT) -U $(DB_USER) -d $(DB_NAME) -v /backups/db_snapshot.dump

# Restore into local DB using Dockerized pg_restore with DB recreate
db/recreate:
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		postgres:16 \
		psql -h localhost -p $(DB_PORT) -U $(DB_USER) -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$(DB_NAME)';" || true
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		postgres:16 \
		psql -h localhost -p $(DB_PORT) -U $(DB_USER) -d postgres -c "DROP DATABASE IF EXISTS $(DB_NAME);" || true
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		postgres:16 \
		psql -h localhost -p $(DB_PORT) -U $(DB_USER) -d postgres -c "CREATE DATABASE $(DB_NAME);" || true
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		-v "$(CURRENT_DIR)":/backups \
		postgres:16 \
		pg_restore --no-owner --no-privileges -h localhost -p $(DB_PORT) -U $(DB_USER) -d $(DB_NAME) -v /backups/db_snapshot.dump || true

# Recreate and restore remote DB (for host 157.180.80.52)
db/recreate-remote:
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		postgres:16 \
		psql -h $(REMOTE_DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='quizedb';" || true
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		postgres:16 \
		psql -h $(REMOTE_DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d postgres -c "DROP DATABASE IF EXISTS quizedb;" || true
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		postgres:16 \
		psql -h $(REMOTE_DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d postgres -c "CREATE DATABASE quizedb;" || true
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		-v "$(CURRENT_DIR)":/backups \
		postgres:16 \
		pg_restore --no-owner --no-privileges -h $(REMOTE_DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d quizedb -v /backups/db_snapshot.dump || true

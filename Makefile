# Load environment variables from .env
include .env
export

# Make a snapshot of the remote database
db/snapshot:
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		-v "$$(pwd)":/backups \
		postgres:16 \
		pg_dump -h $(REMOTE_DB_HOST) -p $(DB_PORT) -U $(DB_USER) -F c -b -v -f /backups/db_snapshot.dump $(DB_NAME)


# Restore into local DB using Dockerized pg_restore
db/restore:
	docker run --rm \
		--network=host \
		-e PGPASSWORD=$(DB_PASSWORD) \
		-v "$$(pwd)":/backups \
		postgres:16 \
		pg_restore --no-owner --no-privileges -h localhost -p $(DB_PORT) -U $(DB_USER) -d $(DB_NAME) -v /backups/db_snapshot.dump



# Requires: Docker Desktop, Node.js 20+
.PHONY: start stop restart logs migrate seed health rebuild reset

NODE ?= node

start:
	$(NODE) scripts/dev-env.mjs start

stop:
	$(NODE) scripts/dev-env.mjs stop

restart:
	$(NODE) scripts/dev-env.mjs restart

logs:
	$(NODE) scripts/dev-env.mjs logs

migrate:
	$(NODE) scripts/dev-env.mjs migrate

seed:
	$(NODE) scripts/dev-env.mjs seed

health:
	$(NODE) scripts/dev-env.mjs health

rebuild:
	$(NODE) scripts/dev-env.mjs rebuild

reset:
	$(NODE) scripts/dev-env.mjs reset

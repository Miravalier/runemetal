DOMAIN = runemetal.local

.PHONY: help backend frontend client nginx pfx

help:
	@echo "make help"
	@echo "  Display this message"
	@echo
	@echo "make frontend"
	@echo "  Copy the front-end files into nginx"
	@echo
	@echo "make backend"
	@echo "  Start the backend in DEBUG mode (requires docker and docker-compose)"
	@echo
	@echo "sudo make nginx"
	@echo "  Serve the application on the provided DOMAIN."

frontend:
	@if [ ! -f .env ]; then \
		echo "No .env found in $$PWD; copy example.env to .env and edit it"; \
		exit 1; \
	fi
	mkdir -p /var/www/runemetal/
	cp $$(find src -type f) /var/www/runemetal/
	cp -r assets/* /var/www/runemetal/

backend:
	@if [ ! -f .env ]; then \
		echo "No .env found in $$PWD; copy example.env to .env and edit it"; \
		exit 1; \
	fi
	docker-compose down
	docker-compose build
	docker-compose up -d

SITE_AVAILABLE := /etc/nginx/sites-available/$(DOMAIN)
SITE_ENABLED := /etc/nginx/sites-enabled/$(DOMAIN)
RAND_OCTET=$(shell python3 -c 'import secrets; print(secrets.randbelow(256))')
nginx:
	@if [ ! -f .env ]; then \
			echo "No .env found in $$PWD; copy example.env to .env and edit it"; \
			exit 1; \
		fi
	@rm -f "$(SITE_ENABLED)"
	@if [ -z "$$(grep "$(DOMAIN)" /etc/hosts)" ]; then \
			echo "127.$(RAND_OCTET).$(RAND_OCTET).$(RAND_OCTET) $(DOMAIN)" >> /etc/hosts; \
		fi
	cp nginx.site "$(SITE_AVAILABLE)"
	. ./.env; sed -i "s/{HTTP_PORT}/$$HTTP_PORT/" "$(SITE_AVAILABLE)"
	sed -i "s/{DOMAIN}/$(DOMAIN)/" "$(SITE_AVAILABLE)"
	ln -s "$(SITE_AVAILABLE)" "$(SITE_ENABLED)"
	service nginx restart
	@echo "chess_server reachable at http://$(DOMAIN)/"

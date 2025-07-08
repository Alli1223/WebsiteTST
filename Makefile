.PHONY: install run

install:
	cd forest-website && npm install

run: install
	npm start --prefix forest-website

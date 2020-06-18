help:
	@echo  "usage: make <target>"
	@echo  "Targets:"
	@echo  "    deps        Ensure dev/test dependencies are installed"
	@echo  "    up          Updates requirements.txt from requirements.in"

deps:
	@pip install --upgrade pip
	@pip install -q pip-tools
	@pip-sync requirements.txt
	@pip install -qe .
	@touch transactions.db
	@echo 'create table transactions(id INTEGER PRIMARY KEY, date DATETIME, authorized BOOLEAN, amount INTEGER, card VARCHAR, description VARCHAR, merchant VARCHAR);' | sqlite3 transactions.db

up:
	pip-compile -v requirements.in

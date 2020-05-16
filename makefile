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

up:
	pip-compile -v requirements.in

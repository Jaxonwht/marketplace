# Betting Marketplace

## Development

Some set up instructions for local development.

### Logging (Web Backend)

In web backend, print statements will not appear in the console. Instead, you can import the `app` instance,
and use `app.logger.info()` or `app.logger.error()` etc.

### Web Backend Setup

This project uses Python 3.10. Please create a virtual environment and upgrade your pip.

```bash
cd web
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip wheel pip-tools
pip install -r dev-requirements.txt
pre-commit install
```

Note that the web backend uses the environment variable `FLASK_CONFIG` to choose the config
yaml file. The default is `Config` if the environment variable is unspecified, and the web
backend will use the [corresponding config file](./web_backend/configs/base.py). All the configs will be merged
into [web_backend/configs/base.py](./web_backend/configs/base.py) to produce the final config.
In [docker-compose.yaml](./docker-compose.yaml), you can see that `FLASK_CONFIG` is set to `DockerDevelopmentConfig`,
which will use this [config file](./web_backend/configs/docker_dev.py).

### Docker Setup

Start the database by `docker compose up db`. Start the development server by `docker compose up web_backend`.

- The web backend server is accessible at `localhost:5000`.
- The postgres server will run at `localhost:5432`.

During development, the code to run Flask will be mounted into the docker container
using volumes. This means changes in code are synced between the hosts and the dockers, while
Docker images are kept at a reasonable size. However in deployment, separate Dockerfiles should be created
that actually add the code into the images themselves via `COPY` or `ADD`.

### Database Migration

First remember to import your model into [migrations/env.py](./web_backend/migrations/env.py). Otherwise,
Migrate may not be able to detect your model at all.

In development context, the Postgres server is running as a docker image. We use [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/)
to do automatic database migrations through SQLAlchemy. Normally you do not have to carry out migration
unless you define a new SQLAlchemy model or modify an existing one. You cannot run `flask db <command>` directly
because the web backend runs in a Docker container. There are three ways to run those commands.

```bash
# First make sure you start the Postgres server.
docker compose up db

# You can ssh into the web_backend server and run commands from within.
docker compose run -it web_backend /bin/bash
flask db migrate -m "Some migration"
flask db upgrade

# You can also run these commands from the host directly.
docker compose run web_backend flask db migrate -m "Some migration"
docker compose run web_backend flask db upgrade
```

In most circumstances, this repository already has alemibc initialized, so you most likely do not
need to run `flask db init`. If you just cloned the repository and need to have the latest database
tables, you do not need to run any migration either. You can simply invoke the `flask db upgrade` command.

Always double-check the auto-generated migration file before commiting to the upgrade.

# Betting Marketplace

## Development

Some set up instructions for local development.

### Logging (Web Backend)

In web backend, print statements will not appear in the console. Instead, you can import the `app` instance,
and use `current_app.logger.info()` or `current_app.logger.error()` etc.

### Client Setup

The client uses React and Node 16. You can start the frontend via `docker compose up client`. The website will
run at `localhost:3000`.

### Web Backend Setup

This project uses Python 3.10. Please create a virtual environment and upgrade your pip.

```bash
cd web_backend
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

Start the database by `docker compose up db`. Start the development server by `docker compose build web_backend` and `docker compose up web_backend`.

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

### Okteto cluster deployment

1. `curl https://get.okteto.com -sSfL | sh` to install the Okteto CLI.
2. `okteto context use https://cloud.okteto.com -n <namespace> -t <token>` to configure CLI.
3. `okteto build . -f Dockerfile.web_backend.prod -t okteto.dev/marketplace-web-backend:latest` to build and push web_backend image to Okteto registry.
4. `okteto kubeconfig`
5. `kubectl apply -f k8s/`

### How to deploy and use secret?

1. `kubectl create secret generic <secret-name> --from-literal='<key>=<secret>'`.
2. Create a Pod that has access to the secret data through a Volume.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: <pod-name>
spec:
  containers:
    - name: <container-name>
      image: nginx
      volumeMounts:
        # name must match the volume name below
        - name: <secret-volume>
          mountPath: <mount-path>
  # The secret data is exposed to Containers in the Pod through a Volume.
  volumes:
    - name: <secret-volume>
      secret:
        secretName: <secret-name>
```

3. Use the secret in code.

```python3
from pathlib import Path

secret = (Path("<mount-path>") / "<key>").read_text()
```

### What secrets need to be deployed?

1. SQLALCHEMY_DATABASE_URI
2. ADMIN_PASSWORD
3. JWT_SECRET_KEY
4. PERPETUAL_SCHEDULER_TOKEN
5. INFURA_PROVIDER_KEY
6. PLATFORM_PRIVATE_KEY
7. COINMARKETCAP_API_KEY
8. MNEMONIC_API_KEY

### Stage

In this repository, the staging environment refers to running the different services with the production setup but in
docker compose. You can start the staging environment with `docker compose -f docker-compose.stage.yaml up`. Note
that the stage environment tries to mimic the production envrionment as much as possible. Therefore, the web_backend
and scheduler in staging mode exposes uwsgi sockets instead of http sockets and the client does implement reverse proxy.
If you want to send a request to the `web_backend`, you should not use `localhost:5000` as the endpoint. Rather, use
`localhost/api`. The client website will simply be located at `localhost`. The scheduler endpoint is still `localhost:4000`.

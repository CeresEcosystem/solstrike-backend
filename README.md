# Sol Strike Backend

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# Setup .env
Create .env file and copy .env.example content

# Start DB
$ docker-compose up

# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Migrations

```bash
# generate migration file
$ yarn typeorm migration:create ./src/database/mysql/migrations/<<file_name>>

# reverting the last migration
$ yarn run typeorm:revert-migration
```

## Swagger UI

http://localhost:3007/api/swagger

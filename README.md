# Simple NestJS Server

Simple server to handle arbitrary API calls. 

Current state includes the following:

1. One `users` module with multi-operation access to PostGres and domain/operation guards for CORS
2. One `discord` module accommodating one `/discord/users-and-roles` route to obtain users by roles

## Environment Setup

- Check the [.env.example](.env.example) file and create a copy:

```bash
cp .env.example .env
```

Assign values that correspond to your environment. 

For Discord, you will need your bot set up with the following settings:

1. Server Members Intent
2. Read Message History
3. View Channels

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).

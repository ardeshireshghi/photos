# photos

This is a simple Photo Gallery app which runs on Heroku and stores photos on S3.

## Installation

You need node >= 12 and `yarn` to run the app.

Run `yarn install`.

## Running the app

Before running the app you need to setup a S3 bucket. Install `aws-cli` and configure the profile.

To setup a new Blob storage (assumes you have AWS account and IAM access to create a new S3 bucket), please do

```sh
$ ./scripts/setup-s3-store.sh <name-of-your-bucket> <optional-aws-region>
```

### Locally

```sh
$ export AWS_PROFILE="name-of-your-aws-profile"
$ cp .env{.sample,}
$ yarn dev
```

Go to http://localhost:9999

## Deployment

Currently, the deployment assumes below:

1. You are deploying to Heroku. You need to set a Heroku account, create a new app and get an Heroku API key.
2. Using Github and need to set the below secrets for Github actions. There is already a "deploy app" action workflow:

- HEROKU_API_KEY
- HEROKU_APP_NAME
- AWS_ACCESS_KEY_ID (access S3 bucket)
- AWS_SECRET_ACCESS_KEY (access S3 bucket)
- ADMIN_USERNAME (basic auth user to access the app)
- ADMIN_PASSWORD (basic auth password to access the app)
- S3_BUCKET (name of the S3 bucket which stores photos)

## Infrastructure

1. **Heroku**: Hosts the web app
2. **AWS**: Hosts the photo Blob (S3 bucket)

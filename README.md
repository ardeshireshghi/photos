# photos

![Gif Demo](assets/audio-stream-screengrab.gif)

PThis is an S3 based photo Gallery app

![Heroku](https://heroku-badge.herokuapp.com/?app=sacred-photoshoots)

## Installation

You need node > 12 and `yarn` to run the app.

Run `yarn install`.

## Running the app

### Locally

```sh
$ export AWS_PROFILE="name-of-your-aws-profile"
$ cp .env{.sample,}
$ yarn dev
```

Go to http://localhost:9999

## Deployment

Currently the app is deployed on Heroku. There is no CI/CD setup at the moment so the deployment happens from a local machine. The current live URL is:

https://sacred-photoshoots.herokuapp.com/

## Infrastructure

1. **Heroku**: Hosts the web app and at the moment the deployment is not automated
2. **AWS**: Hosts the photo Blob (S3 bucket)

# Volunteers

Midburn's volunteers module.


### Installation

Install latest [Node 8](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/)

clone repo
1. run `yarn install`
2. install and run mongodb locally (if you have Docker and Docker compose, just run `docker-compose up -d db`)

Start the dev server

`SPARK_HOST=http://localhost:3000/ yarn run local`

Volunteers should be available at http://localhost:8080/login


### Testing with Spark staging / production

`yarn run start`


### Workflow

Developing branch is `develop`

If you want to build a new feature branch out of `develop`.
Once complete open a new Pull Request back to the `develop` branch.

In this manner we will be able to separate development from production (`master` branch).


### Using the Docker compose environment

```
docker-compose up -d --build
```

Volunteers is available at http://localhost:8000/login


### Setting up the continuous deployment

The continuous deployment requires the following secrets:

`secret-midburn-k8s-ops.json` - private key used to connect to the [midburn-k8s environment](https://github.com/Midburn/midburn-k8s)
* GitHub authenticatin token for a [machine user](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users) - used to update image values in the k8s environment

See [sk8s continuous deployment](https://github.com/orihoch/sk8s#continuous-deployment) for more details.

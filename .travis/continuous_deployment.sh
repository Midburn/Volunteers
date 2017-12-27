#!/usr/bin/env bash

if [ "${DEPLOY_ENVIRONMENT}" != "" ] && [ "${TRAVIS_PULL_REQUEST}" == "false" ] &&\
   [ "${TRAVIS_BRANCH}" == "${DEPLOY_BRANCH}" ] &&\
   [ "${TRAVIS_COMMIT_MESSAGE}" != "" ] && ! echo "${TRAVIS_COMMIT_MESSAGE}" | grep -- --no-deploy && [ "${TRAVIS_COMMIT}" != "" ]
then
    openssl aes-256-cbc -K $encrypted_dbb52b0422d4_key -iv $encrypted_dbb52b0422d4_iv -in secret-midburn-k8s-ops.json.enc -out secret-midburn-k8s-ops.json -d
    OPS_REPO_SLUG="Midburn/midburn-k8s"
    OPS_REPO_BRANCH="master"
    wget https://raw.githubusercontent.com/${OPS_REPO_SLUG}/${OPS_REPO_BRANCH}/run_docker_ops.sh
    chmod +x run_docker_ops.sh
    IMAGE_TAG="gcr.io/uumpa123/volunteers:${TRAVIS_COMMIT}"
    B64_UPDATE_VALUES=`echo '{"volunteers":{"image":"'${IMAGE_TAG}'"}}' | base64 -w0`
    HELM_UPDATE_COMMIT_MESSAGE="${ENVIRONMENT_NAME} volunteers image update --no-deploy"
    ! ./run_docker_ops.sh "${DEPLOY_ENVIRONMENT}" "
        cd /ops
        ! ./helm_update_values.sh '${B64_UPDATE_VALUES}' '${HELM_UPDATE_COMMIT_MESSAGE}' '${K8S_OPS_GITHUB_REPO_TOKEN}' '${OPS_REPO_SLUG}' '${OPS_REPO_BRANCH}' \
            && echo 'failed helm update values' && exit 1
        cd /volunteers;
          ! gcloud container builds submit --tag $IMAGE_TAG . \
            && echo 'failed to build volunteers image' && exit 1
        exit 0
      " "" "${OPS_REPO_SLUG}" "${OPS_REPO_BRANCH}" "" "-v `pwd`:/volunteers" \
        && echo 'failed to run docker ops' && exit 1
fi

exit 0

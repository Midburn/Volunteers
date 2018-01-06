#!/usr/bin/env bash

if [ "${DEPLOY_ENVIRONMENT}" != "" ] && [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${TRAVIS_BRANCH}" == "${DEPLOY_BRANCH}" ] &&\
   [ "${TRAVIS_COMMIT_MESSAGE}" != "" ] && ! echo "${TRAVIS_COMMIT_MESSAGE}" | grep -- --no-deploy && [ "${TRAVIS_COMMIT}" != "" ]
then
    openssl aes-256-cbc -K $encrypted_dbb52b0422d4_key -iv $encrypted_dbb52b0422d4_iv -in ./k8s-ops-secret.json.enc -out secret-k8s-ops.json -d
    K8S_ENVIRONMENT_NAME="${DEPLOY_ENVIRONMENT}"
    OPS_REPO_SLUG="Midburn/midburn-k8s"
    OPS_REPO_BRANCH="master"
    if [ "${TRAVIS_TAG}" != "" ]; then
        IMAGE_TAG="gcr.io/midbarrn/midburn-volunteers-tag:${TRAVIS_TAG}"
    else
        IMAGE_TAG="gcr.io/midbarrn/midburn-volunteers-cd:${TRAVIS_COMMIT}"
    fi
    B64_UPDATE_VALUES=`echo '{"volunteers":{"image":"'${IMAGE_TAG}'"}}' | base64 -w0`
    HELM_UPDATE_COMMIT_MESSAGE="${DEPLOY_ENVIRONMENT} volunteers image update --no-deploy"
    wget https://raw.githubusercontent.com/OriHoch/sk8s-ops/master/run_docker_ops.sh
    chmod +x run_docker_ops.sh
    ! ./run_docker_ops.sh "${K8S_ENVIRONMENT_NAME}" "
       RES=0;
       ! ./helm_update_values.sh '${B64_UPDATE_VALUES}' '${HELM_UPDATE_COMMIT_MESSAGE}' '${K8S_OPS_GITHUB_REPO_TOKEN}' '${OPS_REPO_SLUG}' '${OPS_REPO_BRANCH}' \
            && echo 'failed helm update values' && RES=1;
        ! kubectl set image deployment/volunteers volunteers=${IMAGE_TAG} && echo 'failed to patch deployment' && RES=1;
        cd /volunteers;
        ! gcloud container builds submit --tag $IMAGE_TAG . \
            && echo 'failed to build volunteers image' && RES=1;
        exit "'$'"RES
    " "orihoch/sk8s-ops" "${OPS_REPO_SLUG}" "${OPS_REPO_BRANCH}" "" "-v `pwd`:/volunteers" \
        && echo 'failed to run docker ops' && exit 1
fi

exit 0

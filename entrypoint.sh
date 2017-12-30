#!/usr/bin/env bash

start_server() {
    yarn run start
}

is_db_online() {
    return 0
}

is_allow_populate_db() {
    if [ "${ALLOW_POPULATE_DB}" == "yes" ]; then
        echo "not implemented yet!"
        return 2
    else
        echo "skipping DB populate, ALLOW_POPULATE_DB is not set"
        return 1
    fi
}

populate_db() {
    echo "Populating DB with initial data"
    echo "This will delete all existing DB data!"
    echo "not implemented yet!" && return 1
}

WAIT_MSG="Waiting for DB.."
while ! is_db_online; do
    [ -z "${WAIT_MSG}" ] && echo -n .
    [ ! -z "${WAIT_MSG}" ] && echo "${WAIT_MSG}" && WAIT_MSG=""
    sleep 5
done

is_allow_populate_db && ! populate_db && exit 1

start_server

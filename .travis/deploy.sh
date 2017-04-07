#!/bin/bash -e

if [ "$TRAVIS_REPO_SLUG" = "Midburn/volunteers" ] &&
   [ "$TRAVIS_BRANCH" = "develop" ]; then
	if [ -n "$STAGE_SSH_KEY" ]; then
		echo -e $STAGE_SSH_KEY | base64 -d > stage_machine.key
		chmod 400 stage_machine.key
		ssh -o StrictHostKeyChecking=no -i stage_machine.key "${STAGE_SERVER}" "cd volunteers && git pull -r && npm install && npm run build && pm2 restart all" 2>/dev/null
		RC=$?
		rm -f stage_machine.key
		exit $RC
	fi
else
	echo "Not the oficial development branch, not deploying to stage"
fi

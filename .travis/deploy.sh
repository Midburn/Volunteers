#!/bin/bash -e

if [ "$TRAVIS_REPO_SLUG" = "Midburn/Volunteers" ]; then
	echo "Official repository, yey!"
	if [ -n "$SSH_KEY" ]; then
		if [ "$TRAVIS_BRANCH" = "develop" ]; then
			echo "Deploying to staging server from develop branch"
			echo -e $SSH_KEY | base64 -d > stage_machine.key
			chmod 400 stage_machine.key
			ssh -o StrictHostKeyChecking=no -i stage_machine.key "${STAGE_SERVER}" "cd volunteers && git pull -r && npm install && npm run build && pm2 restart all" 2>/dev/null
			RC=$?
			rm -f stage_machine.key
			exit $RC
		elif [ "$TRAVIS_BRANCH" = "master" ]; then
			echo "Deploying to staging server from master branch"
			echo -e $SSH_KEY | base64 -d > production_machine.key
			chmod 400 production_machine.key
			ssh -o StrictHostKeyChecking=no -i production_machine.key "${PRODUCTION_SERVER}" "cd volunteers && git pull -r && npm install && npm run build && pm2 restart all" 2>/dev/null
			RC=$?
			rm -f production_machine.key
			exit $RC
		else
			echo "Not a branch we deploy from."
		fi
	else
		echo "Can't find deployment SSH key"
	fi
else
	echo "Not the oficial repository, not deploying"
fi

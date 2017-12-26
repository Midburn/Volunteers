FROM node:8

RUN apt-get update && apt-get install -y build-essential

RUN adduser --system volunteers
COPY .npmrc .yarnrc package.json yarn.lock /home/volunteers/
RUN chown -R volunteers /home/volunteers/
USER volunteers
RUN cd /home/volunteers && yarn install --pure-lockfile

USER root
COPY . /home/volunteers
WORKDIR /home/volunteers

ENV PATH="/home/volunteers/node_modules/.bin:${PATH}"

RUN yarn run build

ENTRYPOINT ["/home/volunteers/entrypoint.sh"]

FROM node:20.12.0

COPY . /app

#1 remove previous installed modules (TIREI DO CONTEXTO COM dockerignore)
   # $ rm -r node_modules

ENV REACT_APP_API_URL=http://localhost:8080

WORKDIR /app
RUN yarn install
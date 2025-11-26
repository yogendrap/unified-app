# FROM node:18-alpine AS build
# WORKDIR /usr/src/app

# COPY package.json ./
# RUN npm install

# COPY . .

# EXPOSE 5000
# CMD ["node", "src/app.js"]

FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Install nodemon globally for dev
RUN npm install -g nodemon

COPY . .

# Default command: use nodemon for dev
CMD ["nodemon", "--legacy-watch", "src/server.js"]
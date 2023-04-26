FROM --platform=linux/amd64 node:16.14.2

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV PORT=3000

EXPOSE $PORT

CMD ["npm", "start"]

FROM node:23-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

FROM node:23-alpine AS dev

WORKDIR /app
#I mer dependencies prej deps
COPY --from=deps /app/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

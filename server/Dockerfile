FROM node:24-alpine
WORKDIR /app
ENV TZ=America/Sao_Paulo
RUN apk add --no-cache tzdata
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3333
CMD ["npm", "start"]

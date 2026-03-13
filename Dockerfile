FROM node:20-alpine

WORKDIR /app

# copy dependency files
COPY package.json package-lock.json ./

# install dependencies
RUN npm ci --omit=dev

# copy project files
COPY . .

# Railway assigns port dynamically
ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/index.js"]
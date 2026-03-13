FROM node:20-alpine

WORKDIR /app

# copy package files first
COPY package.json package-lock.json* ./

# install dependencies
RUN npm install --omit=dev

# copy project files
COPY . .

# expose port
EXPOSE 3000

# start app
CMD ["node", "src/index.js"]
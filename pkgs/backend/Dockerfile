FROM oven/bun:latest

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Bundle app source
COPY . .

USER bun
EXPOSE 4004
ENTRYPOINT [ "bun", "run", "main.ts" ]

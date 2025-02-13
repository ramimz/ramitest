FROM node:18-alpine

RUN apk add --no-cache \
    g++ make py3-pip \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dbus \
    xauth \
    xvfb

# Set up working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

COPY prisma /usr/src/app/prisma

# Install Node.js dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium


# Start the application
CMD ["node", "index.js"]
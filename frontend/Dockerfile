# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package.json ./
COPY frontend/yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile || yarn install

# Copy frontend source code
ARG CACHE_BUST=1
COPY frontend/ .

# Build the app
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

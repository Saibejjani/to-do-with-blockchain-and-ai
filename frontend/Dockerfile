# Stage 1: Build the React app
FROM node:20 as builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the app source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the built app with a lightweight HTTP server
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built app from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]
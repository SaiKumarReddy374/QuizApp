# Stage 1: Build the frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:18-alpine

WORKDIR /app

# Copy only the built files
COPY --from=build /app/dist ./dist

# Install a simple static server
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Run the static server
CMD ["serve", "-s", "dist", "-l", "3000"]

# Base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the project
COPY . .

# Expose app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]

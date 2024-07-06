FROM node:20.15.0

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install;

# Install the missing dependency thrown by Docker
RUN npm install @rollup/rollup-linux-arm64-gnu --save-dev

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 3000

# Specify the command to run the application
CMD ["npm", "run", "dev"]
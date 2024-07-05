FROM node:20.15.0

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of your application code
COPY . .

# Generate Prisma Client within the container
RUN npx prisma generate

# Expose the application port
EXPOSE 8000

# Specify the command to run the application
CMD ["npm", "start"]
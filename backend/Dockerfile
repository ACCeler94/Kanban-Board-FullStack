# Use the official Node.js image
FROM node:20.15.0

# Create a group and user
RUN addgroup app && adduser --shell /bin/bash --ingroup app app


# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

RUN npx prisma generate             # Generate Prisma Client within the container

# Change the ownership of the application files to the app user
RUN chown -R app:app /app

# Expose the application port
EXPOSE 8000

# Switch to the app user
USER app

# Specify the command to run the application
CMD ["npm", "start"]
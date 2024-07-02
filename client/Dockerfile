FROM node:20.15.0

# Create a group and user
RUN addgroup app && adduser --shell /bin/bash --ingroup app app


# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

RUN npm install @rollup/rollup-linux-arm64-gnu --save-dev  # Install the missing dependency thrown by docker


# Copy the rest of your application code
COPY . .

# Change the ownership of the application files to the app user 
RUN chown -R app:app /app

# Expose the application port
EXPOSE 3000

# Switch to the app user
USER app  

# Specify the command to run the application
CMD ["npm", "run", "dev"]

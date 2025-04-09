# -------- Builder Stage --------
  FROM node:20.15.0 AS builder

  WORKDIR /app
  
  # Install backend dependencies
  COPY backend/package*.json ./backend/
  RUN cd backend && npm install
  
  # Install frontend dependencies & build it
  COPY client ./client
  WORKDIR /app/client
  RUN npm install
  
  # Define build arguments for frontend environment variables
  ARG VITE_SERVER_URL
  ARG VITE_ROOT_URL
  ARG VITE_API_URL
  ARG VITE_AUTH_URL
  ARG ALLOWED_ORIGINS
  ARG VITE_AUTH0_DOMAIN
  ARG VITE_AUTH0_CLIENT_ID
  
  # Build the frontend with the build arguments
  RUN VITE_SERVER_URL=$VITE_SERVER_URL \
      VITE_ROOT_URL=${VITE_ROOT_URL} \
      VITE_API_URL=$VITE_API_URL \
      VITE_AUTH_URL=$VITE_AUTH_URL \
      ALLOWED_ORIGINS=$ALLOWED_ORIGINS \
      VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN \
      VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID \
      npm run build
  
  # Copy backend source and build it
  WORKDIR /app
  COPY backend ./backend
  # Generate Prisma client
  RUN cd backend && npx prisma generate
  
  # Compile typescript
  RUN cd backend && npm run build
  
  # -------- Production Stage --------
  FROM node:20.15.0
  
  WORKDIR /app
  
  # Copy built backend
  COPY --from=builder /app/backend/dist ./dist
  COPY --from=builder /app/backend/prisma ./prisma
  COPY --from=builder /app/backend/package*.json ./
  RUN npm install --omit=dev
  
  # Copy built frontend
  COPY --from=builder /app/client/dist ./client/dist
  
  ENV NODE_ENV=production
  EXPOSE 8000
  
  CMD ["node", "dist/server.js"]
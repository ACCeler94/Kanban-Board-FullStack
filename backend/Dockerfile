# -------- Builder Stage --------
  FROM node:20.15.0 AS builder

  WORKDIR /app
  
  # Install backend dependencies
  COPY backend/package*.json ./backend/
  RUN cd backend && npm install
  
  # Install frontend dependencies & build it
  COPY client ./client
  RUN cd client && npm install && npm run build
  
  # Copy backend source and build it
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
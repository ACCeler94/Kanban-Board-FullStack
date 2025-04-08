FROM node:20.15.0 AS builder

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Install frontend dependencies and build it
COPY client ./client
RUN cd client && npm install && npm run build

# Copy backend source code
COPY backend ./backend

# Copy built frontend to backend's public directory
RUN rm -rf backend/public && mkdir -p backend/public && \
    cp -r client/dist/* backend/public/

# Generate Prisma client
RUN cd backend && npx prisma generate

# Compile typescript
RUN cd backend && npm run build


FROM node:20.15.0

WORKDIR /app
COPY --from=builder /app/backend ./

ENV NODE_ENV=production

EXPOSE 8000

CMD ["node", "dist/server.js"]
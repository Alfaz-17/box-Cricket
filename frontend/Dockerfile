# ==========================================
# STAGE 1: Build the React App
# ==========================================
# We use Node 20 to install dependencies and run the 'vite build' command.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# We must pass the Google Client ID into the build so React has access to it!
# Docker needs ARGs to accept variables during the build process.
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ==========================================
# STAGE 2: Serve the App using Nginx
# ==========================================
# Nginx is an ultra-fast web server perfectly designed for static files (HTML/CSS/JS).
# We throw away all the Node.js source code to keep the final image incredibly small!
FROM nginx:alpine

# Copy our custom Nginx config (so React Router doesn't break on refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Copy the built files from STAGE 1 into Nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

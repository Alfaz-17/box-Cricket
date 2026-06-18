# STEP 1: Choose the base image.
# We use Node 20 running on Alpine Linux because some packages require Node 20+
FROM node:20-alpine

# STEP 2: Set the working directory inside the container.
# Think of this as creating a folder inside the mini-computer where our app will live.
WORKDIR /app

# STEP 3: Copy package files first.
# We copy package.json first so Docker can cache the installed dependencies.
# If you don't change package.json, Docker won't re-download everything next time!
COPY package*.json ./

# STEP 4: Install dependencies.
RUN npm install

# STEP 5: Copy the rest of the backend code into the container.
COPY . .

# STEP 6: Expose the port your app runs on.
EXPOSE 5001

# STEP 7: Start the backend server using the root package.json start script.
CMD ["npm", "start"]










# /Dockerfile
# From alpine
FROM alpine:3.16.2

# Add nodejs and npm
RUN apk add --update --no-cache nodejs npm

# Add user
ARG USER=PHSCMedia
RUN adduser ${USER} -D

# Set the current working directory to user's home directory
WORKDIR /home/${USER}

# Copy all node files to /home/${USER}
COPY package-lock.json package.json ./

# Install node_modules asap
RUN npm install

# Copy folders
# NOTE: public now stored as a volume since pictures take forever to build
#       This allows the data and images in the container to be modified while running
COPY bin bin/
COPY routes routes/
COPY utils utils/
COPY views views/

# Copy app
COPY app.js .

# Use the user created above
USER ${USER}

# Serve server on 5000
CMD ["npm", "start"]

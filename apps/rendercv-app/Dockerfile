# syntax=docker/dockerfile:1
FROM ghcr.io/rendercv/rendercv:latest


USER root
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl gnupg unzip \
    && mkdir -p /etc/apt/keyrings \
# 2. Download the CORRECT GPG key (note the -repo in the name)
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
# 3. Add the repo with a SPECIFIC version (node_20.x instead of just nodistro)
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
# 4. Update and install
    && apt-get update && apt-get install nodejs -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/*



# Install Bun
RUN curl -fsSL https://bun.sh/install | bash -s -- bun-v1.3.10 && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Copy package files
COPY package.json bun.lock ./
COPY apps/http/package.json apps/http/
COPY apps/rendercv-app/package.json apps/rendercv-app/
COPY packages/contracts/package.json packages/contracts/

# Install only production dependencies
RUN bun install --production --frozen-lockfile --filter ./apps/rendercv-app && \
    rm -rf /root/.bun/install/cache /tmp/* /var/tmp/*

# Copy the built file from builder stage
# COPY --from=builder /src/apps/rendercv-app/dist/index.js apps/rendercv-app/dist/index.js
COPY apps/rendercv-app/dist/index.js apps/rendercv-app/dist/index.js

WORKDIR /app/apps/rendercv-app/

# Expose port
EXPOSE 8080
ENTRYPOINT []

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=5s \
CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["bun", "start"]

# syntax=docker/dockerfile:1
FROM ghcr.io/rendercv/rendercv:latest


USER root
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
# 2. Download the CORRECT GPG key (note the -repo in the name)
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
# 3. Add the repo with a SPECIFIC version (node_20.x instead of just nodistro)
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
# 4. Update and install
    && apt-get update && apt-get install nodejs -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/*



# Install pnpm (update corepack first to fix signature verification issues)
RUN npm install -g corepack@latest && corepack enable && corepack prepare pnpm@10.26.2 --activate

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/rendercv-app/package.json apps/rendercv-app/
COPY packages/contracts/package.json packages/contracts/

# Install only production dependencies and Chromium
RUN pnpm install --prod && \
    # Clean up npm/pnpm cache and temporary files
    pnpm store prune && \
    rm -rf /root/.npm /root/.pnpm-store /tmp/* /var/tmp/*

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
CMD ["pnpm", "start"]

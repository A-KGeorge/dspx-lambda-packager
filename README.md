# dspx-lambda

This repository contains packaging Dockerfiles for building AWS Lambda-compatible Node.js bundles for different CPU architectures.

Note: Replace the top line of `Dockerfile.package` with the Node.js base image and architecture that match your target environment (for example, `FROM node:18-bullseye` or `FROM --platform=linux/arm64 node:18-bullseye`).

x86 build (Intel/AMD):

1. Build the Docker image:

```bash
docker build -t dspx-rebuild -f Dockerfile.package .
```

2. Run the container, copy the generated ZIP, and remove the container:

```bash
docker run -d --name dspx-temp dspx-rebuild
docker cp dspx-temp:/lambda_bundle.zip ./function.zip
docker rm -f dspx-temp
```

ARM build (ARM64):

1. Build the Docker image for ARM64:

```bash
docker build --platform linux/arm64 -t dspx-rebuild -f Dockerfile.package .
```

2. Run the container, copy the generated ZIP, and remove the container:

```bash
docker run -d --name dspx-temp dspx-rebuild
docker cp dspx-temp:/lambda_bundle.zip ./function.zip
docker rm -f dspx-temp
```

Notes:

- **Swap top line**: Edit the first line of `Dockerfile.package` to match the Node.js version and platform you need.
- **Output**: The produced Lambda package is copied to `function.zip` in the current directory.
- **Directory**: Run these commands in the directory containing the `Dockerfile.package` (e.g., the `x86` or `ARM` folders).

# CloudQuery Plugin SDK for JavaScript

This is the high-level package to use for developing CloudQuery plugins in JavaScript.

## Prerequisites

Node.js 20 or higher. Install Node.js from [here](https://nodejs.org/en/download/).

## Setup

### Install dependencies

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Start a local memory based plugin server

```bash
pnpm dev -- serve
```

### Package as a Docker image

```bash
pnpm dev -- package -m test "v1.0.0" . --dist-dir dist-dir
```

### Formatting and Linting

```bash
# This is just to check if the code is formatted
pnpm format:check

# Automatically format code
pnpm format

# Lint
pnpm lint
```

# CloudQuery Plugin SDK for JavaScript

This is the high-level package to use for developing CloudQuery plugins in JavaScript.

## Prerequisites

Node.js 20 or higher. Install Node.js from [here](https://nodejs.org/en/download/).

## Setup

### Install dependencies

```bash
npm ci
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Start a local memory based plugin server

```bash
npm run dev -- serve
```

### Package as a Docker image

```bash
npm run dev -- package -m test "v1.0.0" . --dist-dir dist-dir
```

### Formatting and Linting

```bash
# This is just to check if the code is formatted
npm run format:check

# Automatically format code
npm run format

# Lint
npm run lint
```

# CloudQuery Plugin SDK for JavaScript

This is the high-level package to use for developing CloudQuery plugins in JavaScript.

## Prerequisites

Node.js 16 or higher. Install Node.js from [here](https://nodejs.org/en/download/).

## Setup

### Install dependencies

```bash
npm ci
```

### Run in Development mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Formatting and Linting

```bash
# Format code. Omit -w to just check for formatting issues
prettier -w 'src/**/*.ts'

# Lint
eslint --max-warnings 0 --ext .ts src
 ```

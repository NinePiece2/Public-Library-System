## NOTE

This project has been archived and all deployments have been termianted.

## Requirements
- .NET 9 SDK/Runtime Installed
- NodeJS

## Getting Started

First, run the development server:

```bash
cd PublicLibrarySystem-UI
```

```bash
npm install
```

```bash
npm run dev:full
```

This command runs both the FrontEnd and Backend together.

## Kubernetes Instructions (Assuming you've cloned the repo):

```bash
kubectl create namespace coe892
kubectl apply -f .
```

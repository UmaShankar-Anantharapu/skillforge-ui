#!/bin/bash

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: $0 <development|production>"
  exit 1
fi

if [ "$ENV" = "development" ]; then
  echo "Setting up development environment for UI..."
  echo "To start development server, run: npm install && npm start"
elif [ "$ENV" = "production" ]; then
  echo "Setting up production environment for UI..."
  echo "Installing dependencies..."
  npm install --production
  echo "Building production bundle..."
  npm run build -- --configuration=production
  echo "Production build complete. The output is in the 'dist/' directory."
else
  echo "Invalid environment: $ENV"
  exit 1
fi

echo "UI deployment script finished."
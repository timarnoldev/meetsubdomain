#!/bin/bash
# SSH tunnel to PostgreSQL on Azure VM
# Forwards local port 5432 to the remote Postgres instance

SSH_USER="${SSH_USER:?Set SSH_USER environment variable}"
SSH_HOST="${SSH_HOST:?Set SSH_HOST environment variable}"
LOCAL_PORT="5432"
REMOTE_PORT="5432"

echo "Starting SSH tunnel to PostgreSQL..."
echo "Connect at: postgresql://postgres@localhost:${LOCAL_PORT}/postgres"
echo "Press Ctrl+C to stop the tunnel."

ssh -N -L ${LOCAL_PORT}:localhost:${REMOTE_PORT} ${SSH_USER}@${SSH_HOST}

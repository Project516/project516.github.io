#!/bin/sh
set -e

INSTALL=0
WRITE=0

while [ $# -gt 0 ]; do
    case "$1" in
        -i)
            INSTALL=1
            shift
            ;;
        -w|--write)
            WRITE=1
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [-i] [-w]"
            echo "  (no flags)  Run typos (check only)"
            echo "  -i          Install Rust + typos-cli"
            echo "  -w          Fix typos in place (typos -w)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

if [ "$INSTALL" -eq 1 ]; then
    echo "Installing/updating Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    . "$HOME/.cargo/env"

    echo "Installing typos-cli..."
    cargo install typos-cli --locked
fi

# Make sure cargo/typos are available even if already installed
if [ -f "$HOME/.cargo/env" ]; then
    . "$HOME/.cargo/env"
fi

if [ "$WRITE" -eq 1 ]; then
    echo "Running typos -w..."
    typos -w
else
    echo "Running typos (check only, use -w to fix)..."
    typos
fi

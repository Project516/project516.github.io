#!/bin/sh
set -e

INSTALL=0

while [ $# -gt 0 ]; do
    case "$1" in
        -i)
            INSTALL=1
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [-i]"
            echo "  (no flags)  Run typos -w"
            echo "  -i          Install Rust + typos-cli, then run typos -w"
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

echo "Running typos -w..."
typos -w
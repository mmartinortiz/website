#!/bin/bash

# Create config directories
mkdir -p ~/.config/fish

# Copy starship configuration
cp .devcontainer/starship.toml ~/.config/starship.toml

# Copy fish configuration
cp .devcontainer/config.fish ~/.config/fish/config.fish

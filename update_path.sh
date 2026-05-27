#!/bin/bash
# Update PATH for WSL
if ! grep -q ".local/bin" ~/.bashrc; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi
if ! grep -q ".local/bin" ~/.profile; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.profile
fi
echo "PATH updated successfully!"
echo "Reload your shell or run: source ~/.bashrc"

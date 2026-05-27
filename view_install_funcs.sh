#!/bin/bash
cd ~/hermes-agent
grep -n -A 50 "setup_venv()" scripts/install.sh
echo "---"
grep -n -A 50 "install_deps()" scripts/install.sh
echo "---"
grep -n -A 50 "setup_path()" scripts/install.sh

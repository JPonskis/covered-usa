#!/bin/bash
# CoveredUSA cloud-routine environment setup script.
# Installs the one dependency the Sheets helper scripts need. Cached after first run.
npm install -g googleapis || true

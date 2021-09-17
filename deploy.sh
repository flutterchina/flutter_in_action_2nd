#!/usr/bin/env bash
git commit --allow-empty -m "Trigger rebuild"
git push web main -f

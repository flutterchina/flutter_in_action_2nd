#!/usr/bin/env bash
# git push gitee main -f

#github 作为CDN
git commit --allow-empty -m "Trigger rebuild"
git push web main -f

cd docs
tcb hosting deploy . -e book-1geyi6pf20cab8ee -r gz

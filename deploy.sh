#!/usr/bin/env bash
git commit --allow-empty -m "Trigger rebuild"
git push web main -f

# git push gitee main -f

#cd docs
#tcb hosting deploy . -e book-1geyi6pf20cab8ee -r gz

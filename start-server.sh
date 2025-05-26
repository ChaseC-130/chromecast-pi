#!/usr/bin/env bash
cd /home/chase/chromecast-pi
# serve your build on port 80, binding to 0.0.0.0
exec serve -s build -l 80

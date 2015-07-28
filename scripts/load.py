#!/usr/bin/env python
import psutil
import socket
import json

print json.dumps({
	'uid': socket.gethostname() + "_cpu_perc_1s",
	'percent': round(psutil.cpu_percent(interval=1), 1),
	'description': '1s CPU usage for ' + socket.gethostname(),
})

print json.dumps({
	'uid': socket.gethostname() + "_cpu_perc_1m",
	'percent': round(psutil.cpu_percent(interval=60), 1),
	'description': '1m CPU usage for ' + socket.gethostname(),
})
#!/usr/bin/env python
import psutil
import socket
import json

cpu_per = round(psutil.cpu_percent(interval=60), 1)
print json.dumps({
	'uid': socket.gethostname() + "_cpu_perc_1m",
	'percent': cpu_per,
	'description': '1m CPU usage for ' + socket.gethostname(),
	'state': 'warn' if cpu_per > 90 else 'normal'
})

vmem_per = round(psutil.virtual_memory().percent, 1)
print json.dumps({
	'uid': socket.gethostname() + "_mem_perc",
	'percent': vmem_per,
	'description': 'Memory usage for ' + socket.gethostname(),
	'state': 'warn' if vmem_per > 90 else 'normal'
})
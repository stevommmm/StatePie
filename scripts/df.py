#!/usr/bin/env python

import paramiko
import sys
import re
import json

username = sys.argv[1]
hostname = sys.argv[2]
filesystem = sys.argv[3]

try:
	ssh = paramiko.SSHClient()
	ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
	ssh.connect(hostname, username=username)

	stdin, stdout, stderr = ssh.exec_command('df ' + filesystem)
	stdout_data = stdout.read()
	ssh.close()

	perc_search = re.compile('\s*(\d+)%\s+')
	perc_search_match = perc_search.findall(stdout_data)
	if not perc_search_match:
		perc_search_match = -1
	else:
		perc_search_match = int(perc_search_match[0])

	level = 'alert'
	if perc_search_match < 90 and perc_search_match >= 0:
		level = 'warn'
	if perc_search_match < 60 and perc_search_match >= 0:
		level = 'normal'

	print json.dumps({
		'uid': hostname + "_" + filesystem + "_perc_used",
		'percent': perc_search_match,
		'description': 'Disk usage for %s on %s' % (filesystem, hostname),
		'state': level
	})
except Exception as e:
	print json.dumps({
		'uid': hostname + "_" + filesystem + "_perc_used",
		'percent': -1,
		'description': 'Disk usage for "%s" on "%s". Exception hit :%s' % (filesystem, hostname, repr(e)),
		'state': 'alert',
	})
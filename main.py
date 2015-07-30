#!/usr/bin/env python
import json
import os
import traceback
import mimetypes
import sqlite3
import sys
import subprocess

ROOT = os.path.abspath(os.path.dirname(__file__))
STATIC = os.path.join(ROOT, 'static')
SCRIPTS = os.path.join(ROOT, 'scripts')


# Sadly we run 2.6 in production
if "check_output" not in dir( subprocess ): # duck punch it in!
	def f(*popenargs, **kwargs):
		if 'stdout' in kwargs:
			raise ValueError('stdout argument not allowed, it will be overridden.')
		process = subprocess.Popen(stdout=subprocess.PIPE, *popenargs, **kwargs)
		output, unused_err = process.communicate()
		retcode = process.poll()
		if retcode:
			cmd = kwargs.get("args")
			if cmd is None:
				cmd = popenargs[0]
			raise subprocess.CalledProcessError(retcode, cmd)
		return output
	subprocess.check_output = f


class database(object):
	def __init__(self):
		with self._db() as db:
			c = db.cursor()
			c.execute('''CREATE TABLE IF NOT EXISTS state(uid text primary key, percent int, description text, state int)''')

	def _db(self):
		db = sqlite3.connect(os.path.join(ROOT, 'state.db'))
		db.row_factory = sqlite3.Row
		return db

	def fetch(self):
		with self._db() as db:
			c = db.cursor()
			results = c.execute('''SELECT * FROM state ORDER BY percent DESC''')
			return map(dict, results.fetchall())

	def update(self, uid, percent, description, state):
		with self._db() as db:
			c = db.cursor()
			c.execute('''INSERT OR REPLACE INTO state VALUES(?, ?, ?, ?)''', (uid, percent, description, state))
			db.commit()


class wsgiengine(object):
	""" Our dumb WSGI complaint server, to be run with bjoern later

	Handles files in /static/ if we haven't configured our web server
	to serve those for us ( you should! )
	"""
	def __init__(self):
		self.routes = {}

	def guess_headers(self, filename):
		""" Guess the file mimetype, only used in our /static/ handler """
		headers = []
		mimetype, encoding = mimetypes.guess_type(filename)
		if encoding: 
			headers.append(('Content-Encoding', encoding))
		if mimetype:
			headers.append(('Content-Type', mimetype))
		return headers

	def route_file(self, filename, start_response):
		""" Handle files in /static/ - You should configure the webserver
		to handle these outside of development
		"""
		if filename == '/':
			filename = 'index.html'
		filename = filename.lstrip('\\/')

		fpath = os.path.join(STATIC, filename)
		if not fpath.startswith(STATIC) or not os.path.exists(fpath):
			raise ValueError('Invalid file path')

		start_response('200 OK', self.guess_headers(fpath))
		return open(fpath, 'rb')

	def route_state(self, start_response):
		start_response('200 OK', [('content-type', 'application/json')])
		return json.dumps(database().fetch())


	def wsgi(self, environ, start_response):
		'''WSGI compliant callable, only ever called from __call__'''
		response = {
			'status': '404 Not Found',
			'response_headers': [('content-type', 'text/html')],
			'content': 'Error fetching content',
		}

		def inner_start_response(s, r):
			""" Modifies our mutable state dict above. Given to our handler methods """
			response['status'] = s
			response['response_headers'] = r

		if environ['REQUEST_METHOD'] == 'GET':
			# Handle web browser requests for the dashboard
			if environ['PATH_INFO'] == '/state.json':
				response['content'] = self.route_state(inner_start_response)
			else:
				response['content'] = self.route_file(environ['PATH_INFO'], inner_start_response)

		start_response(response['status'], response['response_headers'])
		return response['content']

	def trywgsi(self, environ, start_response):
		""" Wrap our wsgi callable in a try/catch, dump errors out to web, stacktrace to console """
		try:
			return self.wsgi(environ, start_response)
		except Exception as e:
			traceback.print_exc()
			start_response('500 Internal Server Error', [('content-type', 'text/plain')])
			return "An incident has been recorded:\n" + repr(e)

	def __call__(self, environ, start_response):
		return self.trywgsi(environ, start_response)

	def run(self, host="127.0.0.1", port=8000):
		from wsgiref.simple_server import make_server
		srv =  make_server(host, port, self)
		try:
			srv.serve_forever()
		except KeyboardInterrupt:
			print "Got ctrl + c. Sent shutdown to server."


def scripthandler(scriptname, *args):
	cmd = [os.path.join(SCRIPTS, scriptname)]
	cmd.extend(*args)

	try:
		output = subprocess.check_output(cmd).splitlines()
		for metric in output:
			database().update(**json.loads(metric))
	except Exception as e:
		traceback.print_exc()
		print e



if __name__ == '__main__':
	if '--serve' in sys.argv:
		try:
			import bjoern
			bjoern.run(wsgiengine(), "127.0.0.1", 8000, reuse_port=True)
		except ImportError:
			wsgiengine().run()
	elif '--run' in sys.argv:
		scripthandler(sys.argv[2], sys.argv[3:])
	else:
		print """Usage:

	main.py --serve 					Run an internal webserver to provide state.json
	main.py --run <scriptname> [args]	Run a script in the scripts directory with optional args, the result updates the state.db
"""




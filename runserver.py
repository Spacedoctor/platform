import os, sys, subprocess, time
import errno
import stat
 
class LogWatcher(object):
    """Looks for changes in all files of a directory.
    This is useful for watching log file changes in real-time.
    It also supports files rotation.

    Example:

    >>> def callback(filename, lines):
    ...     print filename, lines
    ...
    >>> l = LogWatcher("/var/log/", callback)
    >>> l.loop()
    """

    def __init__(self, folder, callback, extensions=["log"], tail_lines=0):
        """Arguments:

        (str) @folder:
            the folder to watch

        (callable) @callback:
            a function which is called every time a new line in a
            file being watched is found;
            this is called with "filename" and "lines" arguments.

        (list) @extensions:
            only watch files with these extensions

        (int) @tail_lines:
            read last N lines from files being watched before starting
        """
        self.files_map = {}
        self.callback = callback
        self.folder = os.path.realpath(folder)
        self.extensions = extensions
        assert os.path.isdir(self.folder), "%s does not exists" \
                                            % self.folder
        assert callable(callback)
        self.update_files()
        # The first time we run the script we move all file markers at EOF.
        # In case of files created afterwards we don't do this.
        for id, file in self.files_map.iteritems():
            file.seek(os.path.getsize(file.name))  # EOF
            if tail_lines:
                lines = self.tail(file.name, tail_lines)
                if lines:
                    self.callback(file.name, lines)

    def __del__(self):
        self.close()

    def loop(self, interval=0.1, async=False):
        """Start the loop.
        If async is True make one loop then return.
        """
        while 1:
            self.update_files()
            for fid, file in list(self.files_map.iteritems()):
                self.readfile(file)
            if async:
                return
            time.sleep(interval)

    def log(self, line):
        """Log when a file is un/watched"""
        print line

    def listdir(self):
        """List directory and filter files by extension.
        You may want to override this to add extra logic or
        globbling support.
        """
        ls = os.listdir(self.folder)
        if self.extensions:
            return [x for x in ls if os.path.splitext(x)[1][1:] \
                                           in self.extensions]
        else:
            return ls

    @staticmethod
    def tail(fname, window):
        """Read last N lines from file fname."""
        try:
            f = open(fname, 'r')
        except IOError, err:
            if err.errno == errno.ENOENT:
                return []
            else:
                raise
        else:
            BUFSIZ = 1024
            f.seek(0, os.SEEK_END)
            fsize = f.tell()
            block = -1
            data = ""
            exit = False
            while not exit:
                step = (block * BUFSIZ)
                if abs(step) >= fsize:
                    f.seek(0)
                    exit = True
                else:
                    f.seek(step, os.SEEK_END)
                data = f.read().strip()
                if data.count('\n') >= window:
                    break
                else:
                    block -= 1
            return data.splitlines()[-window:]

    def update_files(self):
        ls = []
        for name in self.listdir():
            absname = os.path.realpath(os.path.join(self.folder, name))
            try:
                st = os.stat(absname)
            except EnvironmentError, err:
                if err.errno != errno.ENOENT:
                    raise
            else:
                if not stat.S_ISREG(st.st_mode):
                    continue
                fid = self.get_file_id(st)
                ls.append((fid, absname))

        # check existent files
        for fid, file in list(self.files_map.iteritems()):
            try:
                st = os.stat(file.name)
            except EnvironmentError, err:
                if err.errno == errno.ENOENT:
                    self.unwatch(file, fid)
                else:
                    raise
            else:
                if fid != self.get_file_id(st):
                    # same name but different file (rotation); reload it.
                    self.unwatch(file, fid)
                    self.watch(file.name)

        # add new ones
        for fid, fname in ls:
            if fid not in self.files_map:
                self.watch(fname)

    def readfile(self, file):
        lines = file.readlines()
        if lines:
            self.callback(file.name, lines)

    def watch(self, fname):
        try:
            file = open(fname, "r")
            fid = self.get_file_id(os.stat(fname))
        except EnvironmentError, err:
            if err.errno != errno.ENOENT:
                raise
        else:
            self.log("watching logfile %s" % fname)
            self.files_map[fid] = file

    def unwatch(self, file, fid):
        # file no longer exists; if it has been renamed
        # try to read it for the last time in case the
        # log rotator has written something in it.
        lines = self.readfile(file)
        self.log("un-watching logfile %s" % file.name)
        del self.files_map[fid]
        if lines:
            self.callback(file.name, lines)

    @staticmethod
    def get_file_id(st):
        return "%xg%x" % (st.st_dev, st.st_ino)

    def close(self):
        for id, file in self.files_map.iteritems():
            file.close()
        self.files_map.clear()

RED = "31m"
BLUE = "34m"
GREEN = "32m"
YELLOW = "33m"
MAGENTA = "35m"

def coloured(s, color):
    return '\033[1;%s%s\033[1;m' % (color, s)

def check_lines(lines):
   while lines:
      line = lines.pop(0).rstrip()
      noheader = False
      if line.startswith("[E ") or line.startswith("Traceback"):
         color = RED
      elif line.startswith("[D "):
         color = BLUE
      elif line.startswith("[I "):
         color = GREEN
      elif line.startswith("[W "):
         color = YELLOW
      else:
         noheader = True
         color = MAGENTA

      if noheader:
         print(line)
      else:
         endheader = line.find(']')
         header = coloured(line[0:endheader + 1], color)
         line = line[endheader + 1:]
         print(header + line)

if __name__ == '__main__':
   path = os.path.dirname(os.path.realpath(__file__))


   os.environ['TEACHER_LOOP_APP'] = path
   os.environ['TEACHER_LOOP_HOST'] = "localhost"
   os.environ['TEACHER_LOOP_NAME'] = "localhost"
   os.environ['TEACHER_LOOP_PORT'] = "8000"
   os.environ['TEACHER_LOOP_DEVEL'] = "true"

   os.environ['TEACHER_LOOP_ROOT'] = "/etc/httpd"
   os.environ['TEACHER_LOOP_DIR'] = path + "/static/dist" 
   os.environ['TEACHER_LOOP_LOGS'] = path + "/logs" 
   os.environ['TEACHER_LOOP_WSGI'] = path + "/settings/wsgi.py" 
   os.environ['TEACHER_LOOP_PID'] = path + "/settings/http.pid" 
   os.environ['TEACHER_LOOP_VIRTV'] = path + "/virtv/lib/python2.7/site-packages" 

   httpd = "httpd -f " + path + "/settings/cee-tools.conf"

   process = subprocess.Popen(httpd.split())

   state = "startup"
   try:
      def callback(filename, lines):
         if "access" in filename:
            pass
         #   print coloured("\n---------- Start Access Log ----------\n", RED)
         #   check_lines(lines)
         #   print coloured("\n---------- END Access Log ----------\n", RED)
         else:
            #print coloured("\n---------- Start Error Log ----------\n", RED)
            check_lines(lines)
            #print coloured("\n---------- End Error Log ----------\n", RED)

         #print coloured("====================================", MAGENTA)
      l = LogWatcher(str(path + "/logs/"), callback)
      l.loop()

   except KeyboardInterrupt:

      clean = "for i in `ipcs -s | awk '/apache/ {print $2}'`; do (ipcrm -s $i); done"
      process = subprocess.Popen(clean, shell=True)

      kill = 's=$(ps aux | grep "[h]ttpd -f"| awk \'{ print $2 }\'); kill -9 $s'
      process = subprocess.Popen(kill, shell=True)

      sys.exit()

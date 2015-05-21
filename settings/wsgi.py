"""
WSGI config for dev_management project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

import os, sys, signal, time

path = os.environ['CEE_TOOLS_APP']

if path not in sys.path:
       sys.path.append(path)

os.environ["DJANGO_SETTINGS_MODULE"] = "settings.settings"

from django.core.wsgi import get_wsgi_application
import django.core.handlers.wsgi
import settings.settings as settings

if settings.DEBUG:
   import settings.monitor as monitor

   monitor.start(interval=1.0)
   monitor.track(os.path.join(os.path.dirname(__file__), 'site.cf'))

application = get_wsgi_application()


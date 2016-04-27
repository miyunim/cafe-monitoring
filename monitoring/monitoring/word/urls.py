from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
  url(r'^$', 'monitoring.word.views.word', name='word'),
  url(r'^wordCount/$', 'monitoring.word.views.wordCount', name='wordCount'),
  url(r'^auto_login/$', 'monitoring.word.views.auto_login', name='auto_login'),
)

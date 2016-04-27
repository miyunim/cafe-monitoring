from django.contrib import admin
from monitoring.word.models import Keyword


class KeywordAdmin(admin.ModelAdmin):
  pass

admin.site.register(Keyword, KeywordAdmin)

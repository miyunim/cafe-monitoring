# /usr/bin/env python
# vim: fileencoding=utf-8 tabstop=2 shiftwidth=2 softtabstop=2 expandtab
from bs4 import BeautifulSoup
from ghost import Ghost
import json
import cookielib
import requests

from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect

from .models import Keyword

COOKIE_FILE = '/home/miyu/miyu-projects/game-monitoring/monitoring/cookie'
LOGIN_ID = 'Naver ID'
LOGIN_PW = 'Naver Password'
CAFE_URL = 'http://m.cafe.naver.com/ArticleSearchList.nhn?'\
           'search.clubid=27248938'
CAFE_ALL_URL = 'http://m.cafe.naver.com/ArticleAllList.nhn?'\
               'search.clubid=27248938'


class NaverCrawler:
  # 새 크롤러를 만듭니다.
  def __init__(self, id, pw, displayFlag=False):
    # 새 Ghost instance를 만들어서 사용합니다.
    self.ghost = Ghost(display=displayFlag, wait_timeout=20)
    self.currentPage = None
    self.login(id, pw)

  # 주어진 페이지를 엽니다. 이미 그 페이지에 있으면 그대로 있습니다.
  def openPage(self, url):
    if self.currentPage == url:
        return
    self.ghost.open(url)
    self.ghost.wait_for_page_loaded()
    self.currentPage = url

  # 네이버 로그인을 수행합니다.
  def login(self, id, pw):
    # 네이버 메인 페이지를 엽니다.
    self.openPage('http://www.naver.com')

    # inner frame에 들어있는 로그인 폼에 값을 채워넣고 클릭을 지시합니다.
    # 이부분은 javascript를 활용했습니다.
    self.ghost.evaluate("""
    (function() {
      var innerDoc = document.getElementById('loginframe').contentWindow.document;
      innerDoc.getElementById('id').value = '%s';
      innerDoc.getElementById('pw').value = '%s';
      innerDoc.getElementsByClassName('btn_login')[0].click();
    })();
    """ % (id, pw), expect_loading=True)

    # 로그인 결과를 기다립니다.
  def cloneCookieJar(self):
    cookieJar = cookielib.LWPCookieJar()
    self.ghost.save_cookies(cookieJar)
    return cookieJar

  # 네이버 메인 페이지에서 검색을 수행합니다.
  def main_search(self, query):
    # 네이버 메인 페이지를 엽니다.
    self.openPage('http://www.naver.com')

    self.ghost.wait_for_selector('#query')
    self.ghost.fill("#sform", {"query": query})
    self.ghost.fire_on('#sform', 'submit', expect_loading=True)


def auto_login(request):
  crawler = NaverCrawler(LOGIN_ID, LOGIN_PW, False)
  cj = crawler.cloneCookieJar()
  cj.save(COOKIE_FILE)
  return redirect('/word/')


def getHTML(keyword, url, currentPage, totalCount=None, soup_list=[]):
  cj = cookielib.LWPCookieJar()
  cj.load(COOKIE_FILE)

  _url = url % (currentPage, keyword)
  if keyword == "":
    _url = (url % currentPage)

  r = requests.post(_url, cookies=cj)
  soup = BeautifulSoup(r.text)
  total = soup.select(".cu_pg2_total")

  if len(total) > 0:
    totalCount = totalCount or int(str(total[0].text).replace("/", "").strip())

  soup_list.append(soup)
  if (currentPage * 20) < totalCount:
    currentPage += 1
    getHTML(keyword, url, currentPage, totalCount, soup_list)

  return soup_list


def word(request):
  keyword = request.GET.get('keyword') or ''

  url = CAFE_URL + '&search.sortBy=date&search.page=%s&search.query=%s'
  if keyword == '':
    url = 'http://m.cafe.naver.com/ArticleAllList.nhn?'\
          'search.boardtype=L&search.questionTab=A'\
          '&search.clubid=27248938&search.page=%s'

  soup_list = getHTML(keyword, url, 1, None, [])
  title_list = []
  for soup in soup_list:
    html = soup.select(".lst4 li")
    for tag in html:
      title_list.append(dict({
        'title': str(tag.select('a strong')[0].text.encode('utf-8')),
        'info': str(tag.select('a .info')[0].text.encode('utf-8')),
        'href': tag.select('a')[0]['href'],
      }))

  keyword_count = len(Keyword.objects.filter(word=keyword))
  if keyword_count < 1:
    keyword_model = Keyword(word=keyword, count=len(title_list))
    keyword_model.save()

  ctx = {
    'html': title_list,
    'total_count': len(title_list),
    'keyword': keyword,
    'words': Keyword.objects.all(),
  }

  if request.is_ajax():
    return HttpResponse(
      json.dumps({'total_count': len(title_list)}),
      content_type='application/json')

  return render(request, 'word.html', ctx)


def wordCount(request):
  keyword = request.GET.get('keyword') or ''

  url = CAFE_URL + '&search.sortBy=date&search.page=%s&search.query=%s'
  if keyword == '':
    url = 'http://m.cafe.naver.com/ArticleAllList.nhn?'\
          'search.boardtype=L&search.questionTab=A'\
          '&search.clubid=27248938&search.page=%s'

  soup_list = getHTML(keyword, url, 1, None, [])

  title_list = 0
  for soup in soup_list:
    html = soup.select(".lst4 li")
    for tag in html:
      title_list = title_list + 1

  Keyword.objects.filter(word=keyword).update(count=int(title_list))
  ctx = {
    'total_count': title_list,
  }

  return HttpResponse(
    json.dumps(ctx),
    content_type='application/json')

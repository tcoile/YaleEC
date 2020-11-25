import secrets

SECRET_KEY = secrets.token_urlsafe(26)
FLASK_ENV = 'development'
CAS_SERVER = 'https://secure.its.yale.edu'
CAS_LOGIN_ROUTE = '/cas/login'
CAS_AFTER_LOGIN = '/react'
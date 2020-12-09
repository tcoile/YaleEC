#!/usr/bin/env python3

# Flask Server Modules
from flask import Flask, jsonify, request, send_from_directory, redirect, url_for, abort, render_template, Response
import flask
from flask_cors import CORS, cross_origin
import requests
import datetime as dt
import logging
import json

# Authentication
from flask_cas import CAS, login_required
from functools import wraps

# Firebase Modules
from firebase_admin import credentials, firestore, initialize_app

# Create App with Config
app = Flask(__name__)
app.config.from_pyfile('config.py')
logging.basicConfig(level=logging.DEBUG)

# Initialize Firestore DB
cred = credentials.Certificate('key.json')
initialize_app(cred)
db = firestore.client()
CORS(app)
cas = CAS(app)

def login_redirect(function):
    @wraps(function)
    def wrap(*args, **kwargs):
        if 'CAS_USERNAME' not in flask.session:
            flask.session['CAS_AFTER_LOGIN_SESSION_URL'] = (
                flask.request.script_root +
                flask.request.full_path
            )
            return flask.redirect('/home')
        else:
            return function(*args, **kwargs)
    return wrap


# set JSON encoder to handle dates the way we want
# custom JSON encoder to handle dates and times
class FlaskDateTimeEncoder(flask.json.JSONEncoder):
    """
    Custom JSON encoder to handle dates and times.
    """

    # based on https://stackoverflow.com/questions/43663552/keep-a-datetime-date-in-yyyy-mm-dd-format-when-using-flasks-jsonify
    def default(self, obj):
        """
        Given datetime, date, or time object obj, return a string representation
        of it. If obj is not one of those types, call the parent class
        default().
        """

        try:
            if isinstance(obj, dt.datetime):
                return obj.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(obj, dt.date):
                return obj.strftime('%Y-%m-%d')
            elif isinstance(obj, dt.time):
                return obj.strftime('%H:%M:%S')

            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        
        return flask.json.JSONEncoder.default(self, obj)
app.json_encoder = FlaskDateTimeEncoder

@app.route('/get_organizations')
@login_required
def get_organizations():
    with open('firestoredata.py') as f:
        data = json.load(f)
    f.close()

    app.logger.info(type(data))
    app.logger.info(type(jsonify(data)))
    return jsonify(data)
    # documents = db.collection(u'organizations').stream()
    # tester = []
    # for doc in documents:
    #     tester.append(doc.to_dict())
    # return jsonify(tester)

# login_required redirects to login
# login serves up our home 'login' page

# on button click on home 'login' page, we call method 'cas-authenticate', with next=/
@app.route('/home')
@app.route('/home/<path:filename>')
def home(filename='index.html'): 
    flask.session['CAS_AFTER_LOGIN_SESSION_URL'] = '/'
    if (filename == 'index.html' or filename == 'manifest.json'):
        full_url = f'http://localhost:3001/' + filename
    else:
        full_url = f'http://localhost:3001/home' + filename
    
    return requests.get(full_url).content

@app.route('/')
@app.route('/<path:filename>')
@login_redirect
def load_react(filename = "index.html"):
    app.logger.info('got to home')
    app.logger.info(filename)
    full_url = f'http://localhost:3000/' + filename
    app.logger.info(full_url)
    return requests.get(full_url).content
    
app.run(debug=True)
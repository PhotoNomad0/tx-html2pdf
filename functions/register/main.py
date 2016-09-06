# -*- coding: utf-8 -*-

# Method for  registering this module

from __future__ import print_function, unicode_literals
import requests
import json

def handle(event, ctx):
    if not 'api_url' in event:
        raise Exception("'api_url' not in payload")

    post_url = event['api_url']+'/tx/module'
    post_data = {
                 "name": "tx-html2pdf_convert",
                 "version": "1",
                 "type": "conversion",
                 "resource_types": ["obs", "bible", "tn", "ta", "tw", "tq"],
                 "input_format": ["html"],
                 "output_format": ["pdf"],
                 "options": ["language", "css", "page_size"],
                 "private_links": [],
                 "public_links": []
                 }

    response = requests.post(post_url, data=post_data, headers={'content-type': 'application/json'})
    return json.loads(response.text)

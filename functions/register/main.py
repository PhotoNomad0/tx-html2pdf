# -*- coding: utf-8 -*-

# Method for  registering this module

from __future__ import print_function

import boto3
import json

def handle(e, ctx):
    register_payload = {
        "action": "module",
        "data": {
            "name": "tx-html2pdf_convert",
            "version": "1",
            "type": "conversion",
            "resource_types": [ "obs", "bible" ],
            "input_format": [ "html" ],
            "output_format": [ "pdf" ],
            "options": [ "language", "css", "page_size" ],
            "private_links": [ ],
            "public_links": [
                {
                    "href": "/html2pdf",
                    "rel": "list",
                    "method": "GET"
                },
                {
                    "href": "/html2pdf",
                    "rel": "create",
                    "method": "POST"
                },
            ]
        }
    }

    lambda_client = boto3.client('lambda')
    response = lambda_client.invoke(FunctionName='tx-manager_request',Payload=json.dumps(register_payload))
    payload = json.loads(response['Payload'].read())
    if 'error' in payload:
        return 'Bad Request: {0}'.format(payload["error"])
    else:
        return {'success': True}
     


# -*- coding: utf-8 -*-
"""
Created on Fri Mar 24 19:28:19 2017

@author: hhv

FastemsAPI, Trelab API -> Python -> Node.js -> Blend4Web
This is the Python code for the FTest17 testing pipeline.
"""

import numpy as np
import matplotlib.pyplot as plt

import json
import urllib.request
from urllib.error import URLError, HTTPError
import requests
import time
import socket

#+++++++++++++++++++A Function for getting stuff from the Fastems Thingworx mobile api
def get_fastems_api_data(apiEndpoint):
    baseurl = 'https://fastems-sandbox.cloud.thingworx.com/Thingworx/Things/MobileApi_v2/services/'
    appKey = '623064f6-a306-4cc5-87e6-2c6689dc9e9c'
    headers = {'appKey': appKey,'Accept': 'application/json'}
    payload = {}
    try: 
        r = requests.post(baseurl+apiEndpoint, headers=headers,data=payload)
        print('Fastems Cloud Status Code: ',r.status_code)
        #print(r.text)
        out = r.json()
    except HTTPError as e:
        print('The server couldn\'t fulfill the request.')
        print('Error code: ', e.code)
    except URLError as e:
        print('We failed to reach a server.')
        print('Reason: ', e.reason)
    return out

def removekeys(d, key1, key2):
    r = dict(d)
    del r[key1]
    del r[key2]
    return r

if __name__ == "__main__":  
    
#+++++++++++++GETTING THE FASTEMS SUBSYSTEM STATUS DATA++++++++++++++++++++++++++++++    
#define a dictionary for all the required elements
    Device_statuses = {'SC' : {'DeviceName': 'Hissi','MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'LS 1' : {'DeviceName': 'Latausasema1', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'LS 2' : {'DeviceName': 'Latausasema2', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'MC 1' : {'DeviceName': 'Machine1', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'MC 2' : {'DeviceName': 'Machine2', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'CC' : {'DeviceName': 'Cell Controller', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0}}

    apiEndpoint2 = 'GetSystemsStatuses'
    url_mc1 = 'http://localhost:3000/subsystem/mc1'
    url_mc2 = 'http://localhost:3000/subsystem/mc2'
    url_cc = 'http://localhost:3000/subsystem/cc'

    sleep_time = 5 #CHANGE THIS TO SET THE DELAY BETWEEN ITERATIONS OF THE LOOP! 

    while True:
        #get status data from Fastems   
        SystemStatuses = get_fastems_api_data(apiEndpoint2)
        Statuses = SystemStatuses['rows'][0]['DeviceListWithStatuses']['rows']
    
        # populate the dictionary using the downloaded status data, based on the ShortAliases of the devices
        for k in range (len(Statuses)):
            d_id = Statuses[k]['ShortAlias']
            for subkey in Statuses[k]:        
                Device_statuses[d_id][subkey] = Statuses[k][subkey]
    
        #Choose the wanted values for posting:
        mc1_status = json.dumps(removekeys(Device_statuses['MC 1'], 'DeviceName', 'ShortAlias'))
        mc2_status = json.dumps(removekeys(Device_statuses['MC 2'], 'DeviceName', 'ShortAlias'))    
        cc_status = json.dumps(removekeys(Device_statuses['CC'], 'DeviceName', 'ShortAlias'))    
        
        #Post to urls
        r1 = requests.post(url = url_mc1, data = mc1_status)
        r2 = requests.post(url = url_mc2, data = mc2_status)
        r3 = requests.post(url = url_cc, data = cc_status)
    
        #Delay the next iteration of the loop for sleep_time seconds
        time.sleep(sleep_time)
    

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

import socket
import time

#+++++++++++++++++++A Function for getting stuff from the Fastems Thingworx mobile api
def get_fastems_api_data(apiEndpoint):
    baseurl = 'https://fastems-sandbox.cloud.thingworx.com/Thingworx/Things/MobileApi_v2/services/'
    appKey = '623064f6-a306-4cc5-87e6-2c6689dc9e9c'
    headers = {'appKey': appKey,'Accept': 'application/json'}
    payload = {}
    try: 
        r = requests.post(baseurl+apiEndpoint, headers=headers,data=payload)
        print('Status code: ',r.status_code)
        #print(r.text)
        out = r.json()
    except HTTPError as e:
        print('The server couldn\'t fulfill the request.')
        print('Error code: ', e.code)
    except URLError as e:
        print('We failed to reach a server.')
        print('Reason: ', e.reason)
    return out



if __name__ == "__main__":  
    
#+++++++++++++GETTING THE FASTEMS SUBSYSTEM STATUS DATA++++++++++++++++++++++++++++++    
    #get the status information
 #define a dictionary for all the required elements
    Device_statuses = {'SC' : {'DeviceName': 'Hissi','MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'LS 1' : {'DeviceName': 'Latausasema1', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'LS 2' : {'DeviceName': 'Latausasema2', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'MC 1' : {'DeviceName': 'Machine1', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'MC 2' : {'DeviceName': 'Machine2', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0},
                        'CC' : {'DeviceName': 'Cell Controller', 'MaxAlertLevel': 0, 'OrderId' : 0, 'Status' : 0, 'StatusChanged' : 0, 'StatusColor' : 0}}
    

    apiEndpoint2 = 'GetSystemsStatuses'
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(("127.0.0.1.",1337)) #open a socket    

    sleep_time = 20
    counter = 0
    while True:    
       
        SystemStatuses = get_fastems_api_data(apiEndpoint2)
        Statuses = SystemStatuses['rows'][0]['DeviceListWithStatuses']['rows']

        for k in range (len(Statuses)):
           d_id = Statuses[k]['ShortAlias']
           for subkey in Statuses[k]:        
               Device_statuses[d_id][subkey] = Statuses[k][subkey]
    
        testmessage = Device_statuses #Status_colors
  
    
    #create a test message
        msg = json.dumps(testmessage) #convert string to json
        msg = msg.encode('utf8') #convert json to bytes (required by the socket, not needed by other methods!)   
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(("127.0.0.1.",1337)) #open a socket            
        
        sock.send(msg) #send the message on running the model
        print("sent", counter)
        counter += 1
        time.sleep(sleep_time)

            
            

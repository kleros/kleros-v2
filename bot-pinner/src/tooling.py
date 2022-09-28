import time
import socket
import logging
import sys
import glob
import json
from web3 import  Web3

def create_logger():
    # create a logger object
    logger = logging.getLogger('kleros-v2-evidence-collector')
    logger.setLevel(logging.INFO)
    logfile = logging.StreamHandler(sys.stdout)
    fmt = '%(asctime)s  %(levelname)s  %(message)s'
    formatter = logging.Formatter(fmt)
    logfile.setFormatter(formatter)
    logger.addHandler(logfile)
    return logger


def motd():
    kleros = """
            _-_.
         _-',^. `-_.
     ._-' ,'   `.   `-_
    !`-_._________`-':::
    !   /\        /\::::
    ;  /  \      /..\:::
    ! /    \    /....\::
    !/      \  /......\:
    ;--.___. \/_.__.--;;
     '-_    `:!;;;;;;;'
        `-_, :!;;;''
            `-!'
    """
    print("Booting...")
    print(kleros)
    print("Kleros Court V2 Evidence Collector!")
    time.sleep(10)  # Wait for IPFS to come up
    print(additional_info())


def  additional_info():
    ipfs_api = port_up(8080)
    ipfs_gw = port_up(5001)
    if ipfs_api == 0 and ipfs_gw == 0:
        return "Gateway and API are up.  IPFS WebUI: http://127.0.0.1:5001/webui"
    if ipfs_api == 0:
        return "API is up"
    return "API or Gateway unavailable. (If running on different ports, disregard this check)"


def port_up(port: int, host="127.0.0.1"):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((host, port))
    sock.close()
    return result



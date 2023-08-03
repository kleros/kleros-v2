import time
import logging
import sys
import requests


def check_ipfs(IPFS, logger):
    try:
        r = requests.post(f"{IPFS}/version")
    except:
        logger.error("Couldn't connect to IPFS API, retrying..")
        time.sleep(15)
        check_ipfs(IPFS, logger)


def create_logger(IPFS):
    # create a logger object
    logger = logging.getLogger('kleros-v2-evidence')
    logger.setLevel(logging.INFO)
    logfile = logging.StreamHandler(sys.stdout)
    fmt = '%(asctime)s  %(levelname)s  %(message)s'
    formatter = logging.Formatter(fmt)
    logfile.setFormatter(formatter)
    logger.addHandler(logfile)
    motd()
    check_ipfs(IPFS, logger)
    add_peers(IPFS, logger)
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
    motd = f"""
Booting... \
        {kleros}  \
        Kleros Court V2 Evidence Collector!"""
    print(motd)


def add_peers(ipfs, logger):
    with open('peers.txt') as f:
        peers = f.read().splitlines()
    for peer in peers:
        r = requests.post(f"{ipfs}/swarm/connect?arg={peer}", timeout=25)
        if r.status_code == 200:
            logger.info(f"Succesfully added peer: {[peer]}")
        if r.status_code != 200:
            logger.warning(f"Couldn't add {peer} to peerlist {r.content}")




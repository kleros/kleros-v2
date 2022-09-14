from web3 import Web3
import requests
import os
import time
from tooling import motd, create_logger
import json
import glob





# Init
RPC = os.environ.get("RPC", "http://localhost:8545")
IPFS = os.environ.get("IPFS", "http://ipfs-cluster.dappnode:9094")
INTERVAL = os.environ.get("INTERVAL", 600)  # Events are not constantly listened to, instead it checks per INTERVAL.
RETRY = int(os.environ.get("RETRY", 0))  # Retry interval value
attempted_retries = dict()

logger = create_logger(IPFS)

# Contract / RPC
w3 = Web3(Web3.HTTPProvider(RPC))

# Read block height from disk or pull latest
block = 0
try:
    with open("/var/lib/data/block") as file:
        block = file.read()
except FileNotFoundError:
    block = w3.eth.getBlock("latest")['number']

# Read want-list from disk
hashes_wanted = list()
try:
    with open("/var/lib/data/missed_hashes") as file:
        hashes_wanted = file.read().splitlines()
except FileNotFoundError:
    pass


def main():
    block_number = block
    tasks = ["Evidence"]
    contracts = get_contracts()
    while True:
        logger.info(f"Cycle starting from block #{block_number}. WANTED HASHES: {len(hashes_wanted)}")
        latest = w3.eth.getBlock('latest')['number']
        for contract in contracts:
            for task in tasks:
                event_filter = eval(str(f'contract.events.{task}.createFilter(fromBlock={block_number}, toBlock={latest})'))
                for event in event_filter.get_all_entries():
                    try:
                        add_hash(event['args']['_evidence'])
                    except Exception as e:
                        logger.error(f"Failure {e} at {block_number}")
        block_number = latest

        # Keep track of block height
        with open("/var/lib/data/block", "w") as file:
            file.write(str(latest))

        if len(hashes_wanted) > 0:
            retry_hashes()

        # Persist want-list
        with open('/var/lib/data/missed_hashes', 'w') as f:
            for line in hashes_wanted:
                f.write(f"{line}\n")
        time.sleep(int(INTERVAL))


def retry_hashes():
    for _hash in hashes_wanted:
        if not _hash in attempted_retries:
            attempted_retries[_hash] = 0
        else:
            attempted_retries[_hash] += 1
        if RETRY == 0 or attempted_retries[_hash] < RETRY:
            add_hash(_hash)
        elif attempted_retries[_hash] > int(RETRY + 10):
            attempted_retries[_hash] = int(RETRY - 2) # Reset the search


def check_hash(_hash):
    return _hash.rsplit('/', 1)[0] # Recursive pin // i.e. strip _hash/something.json


def add_hash(_hash):
    _hash = check_hash(_hash)
    try:
        r = requests.post(f"{IPFS}/pin/add/{_hash}", timeout=30)
        logger.info(f"Added {_hash}")
        if _hash in hashes_wanted: hashes_wanted.remove(_hash)
    except requests.exceptions.ReadTimeout:
        logger.warning(f"Time-out: Couldn't find {_hash} on the IPFS network")
        if _hash not in hashes_wanted: hashes_wanted.append(_hash)


def get_contracts():
    contracts = []
    for f in glob.glob('/var/lib/watchlist/**/*.json', recursive=True):
        try:
            with open(f) as fio:
                data=json.load(fio)
                abi = data["abi"]
                address = w3.toChecksumAddress(data["address"])
                contracts.append(w3.eth.contract(address=address, abi=abi))
                logger.info(f"Adding to the watchlist: {address}")
        except FileNotFoundError:
            pass
    return contracts


if __name__ == '__main__':
    main()

from web3 import Web3
import requests
import os
import time
from tooling import motd, create_logger, port_up
import json
import glob


logger = create_logger()
motd()

# Init
HASHES_LIST = list()
HASHES_DICT = dict()
RPC = os.environ.get("RPC", "http://localhost:8545")
INTERVAL = os.environ.get("INTERVAL", 600)  # Events are not constantly listened to, instead it checks per INTERVAL.
RETRY = int(os.environ.get("RETRY", 0)) # Retry interval value

# Contract / RPC
w3 = Web3(Web3.HTTPProvider(RPC))

# Read block height from disk or pull latest
try:
    with open("/var/lib/data/block") as file:
        block = file.read()
except FileNotFoundError:
    block = w3.eth.getBlock("latest")['number']

# Read want-list from disk
try:
    with open("/var/lib/data/missed_hashes") as file:
        HASHES_LIST = file.read().splitlines()
except FileNotFoundError:
    pass


def main():
    block_number = block
    tasks = ["Evidence"]
    contracts = get_contracts()
    while True:
        logger.info(f"Cycle starting from block #{block_number}. WANTED HASHES: {len(HASHES_LIST)}")
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

        if len(HASHES_LIST) > 0:
            retry_hashes()

        # Persist want-list
        with open('/var/lib/data/missed_hashes', 'w') as f:
            for line in HASHES_LIST:
                f.write(f"{line}\n")
        time.sleep(int(INTERVAL))


def retry_hashes():
    for _hash in HASHES_LIST:
        if not _hash in HASHES_DICT:
            HASHES_DICT[_hash] = 0
        else:
            HASHES_DICT[_hash] += 1
        if RETRY == 0 or HASHES_DICT[_hash] < RETRY:
            add_hash(_hash)
            continue
        if HASHES_DICT[_hash] > int(RETRY + 10): HASHES_DICT[_hash] = int(RETRY-2) # Reset the search


def check_hash(_hash):
    return _hash.rsplit('/', 1)[0] # Recursive pin // i.e. strip _hash/something.json


def add_hash(_hash):
    _hash = check_hash(_hash)
    try:
        r = requests.post(f"http://localhost:5001/api/v0/pin/add/{_hash}", timeout=30)
        logger.info(f"Added {_hash}")
        if _hash in HASHES_LIST: HASHES_LIST.remove(_hash)
    except requests.exceptions.ReadTimeout:
        logger.warning(f"Time-out: Couldn't find {_hash} on the IPFS network")
        if _hash not in HASHES_LIST: HASHES_LIST.append(_hash)


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

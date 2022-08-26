from web3 import Web3
import requests
import json
import os
import time

print("Booting...")

RPC = os.environ.get("RPC", "http://localhost:8545")
INTERVAL = os.environ.get("INTERVAL", 600)

with open("/var/lib/data/block") as file:
    block = file.read()
w3 = Web3(Web3.HTTPProvider(RPC))
address = '0xA2c538AA05BBCc44c213441f6f3777223D2BF9e5' # DisputeKitClassic on ArbitrumRinkeby
address = w3.toChecksumAddress(address)
abi = '[{"inputs":[{"internalType":"address","name":"_governor","type":"address"},{"internalType":"contract KlerosCore","name":"_core","type":"address"},{"internalType":"contract RNG","name":"_rng","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"_choice","type":"uint256"}],"name":"ChoiceFunded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_choice","type":"uint256"},{"indexed":true,"internalType":"address","name":"_contributor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"Contribution","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"contract IArbitrator","name":"_arbitrator","type":"address"},{"indexed":true,"internalType":"uint256","name":"_evidenceGroupID","type":"uint256"},{"indexed":true,"internalType":"address","name":"_party","type":"address"},{"indexed":false,"internalType":"string","name":"_evidence","type":"string"}],"name":"Evidence","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"indexed":true,"internalType":"address","name":"_juror","type":"address"},{"indexed":true,"internalType":"uint256","name":"_choice","type":"uint256"},{"indexed":false,"internalType":"string","name":"_justification","type":"string"}],"name":"Justification","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum DisputeKitClassic.Phase","name":"_phase","type":"uint8"}],"name":"NewPhaseDisputeKit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_choice","type":"uint256"},{"indexed":true,"internalType":"address","name":"_contributor","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"LOSER_APPEAL_PERIOD_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LOSER_STAKE_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ONE_BASIS_POINT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RNBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WINNER_STAKE_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"}],"name":"areCommitsAllCast","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"}],"name":"areVotesAllCast","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256[]","name":"_voteIDs","type":"uint256[]"},{"internalType":"bytes32","name":"_commit","type":"bytes32"}],"name":"castCommit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256[]","name":"_voteIDs","type":"uint256[]"},{"internalType":"uint256","name":"_choice","type":"uint256"},{"internalType":"uint256","name":"_salt","type":"uint256"},{"internalType":"string","name":"_justification","type":"string"}],"name":"castVote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_core","type":"address"}],"name":"changeCore","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_governor","type":"address"}],"name":"changeGovernor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract RNG","name":"_rng","type":"address"}],"name":"changeRandomNumberGenerator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"core","outputs":[{"internalType":"contract KlerosCore","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"coreDisputeIDToLocal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256","name":"_numberOfChoices","type":"uint256"},{"internalType":"bytes","name":"_extraData","type":"bytes"},{"internalType":"uint256","name":"_nbVotes","type":"uint256"}],"name":"createDispute","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"}],"name":"currentRuling","outputs":[{"internalType":"uint256","name":"ruling","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"disputes","outputs":[{"internalType":"uint256","name":"numberOfChoices","type":"uint256"},{"internalType":"bool","name":"jumped","type":"bool"},{"internalType":"bytes","name":"extraData","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"disputesWithoutJurors","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"}],"name":"draw","outputs":[{"internalType":"address","name":"drawnAddress","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_destination","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"executeGovernorProposal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256","name":"_choice","type":"uint256"}],"name":"fundAppeal","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256","name":"_coreRoundID","type":"uint256"}],"name":"getCoherentCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"internalType":"uint256","name":"_voteID","type":"uint256"}],"name":"getDegreeOfCoherence","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"}],"name":"getLastRoundResult","outputs":[{"internalType":"uint256","name":"winningChoice","type":"uint256"},{"internalType":"bool","name":"tied","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"internalType":"uint256","name":"_choice","type":"uint256"}],"name":"getRoundInfo","outputs":[{"internalType":"uint256","name":"winningChoice","type":"uint256"},{"internalType":"bool","name":"tied","type":"bool"},{"internalType":"uint256","name":"totalVoted","type":"uint256"},{"internalType":"uint256","name":"totalCommited","type":"uint256"},{"internalType":"uint256","name":"nbVoters","type":"uint256"},{"internalType":"uint256","name":"choiceCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"internalType":"uint256","name":"_voteID","type":"uint256"}],"name":"getVoteInfo","outputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"commit","type":"bytes32"},{"internalType":"uint256","name":"choice","type":"uint256"},{"internalType":"bool","name":"voted","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"governor","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isResolving","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"internalType":"uint256","name":"_voteID","type":"uint256"}],"name":"isVoteActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"passPhase","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"phase","outputs":[{"internalType":"enum DisputeKitClassic.Phase","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rng","outputs":[{"internalType":"contract RNG","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_evidenceGroupID","type":"uint256"},{"internalType":"string","name":"_evidence","type":"string"}],"name":"submitEvidence","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_coreDisputeID","type":"uint256"},{"internalType":"address payable","name":"_beneficiary","type":"address"},{"internalType":"uint256","name":"_coreRoundID","type":"uint256"},{"internalType":"uint256","name":"_choice","type":"uint256"}],"name":"withdrawFeesAndRewards","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]'
contract = w3.eth.contract(address=address, abi=abi)

def main():
    block_number = block
    while True:
        tasks = ["Evidence"]
        latest = w3.eth.getBlock('latest')['number']
        for task in tasks:
            event_filter = eval(str(f'contract.events.{task}.createFilter(fromBlock={block_number}, toBlock={latest})'))
            for event in event_filter.get_all_entries():
                try:
                    if task == "Evidence":
                            add_evidence(event['transactionHash'].hex())
                except Exception as e :
                    print(f"Failure {e} at {block_number}")

        block_number = latest
        with open("/var/lib/data/block", "w") as file:
            file.write(str(latest))
        time.sleep(int(INTERVAL))


def _get_ipfs_data(uri):
    url = 'https://ipfs.io/' + uri
    try:
        r = requests.get(url)
    except requests.exceptions.RequestException as e:
        raise SystemExit(e)
    return r.content


def add_hash(_hash):
    r = requests.post(f"http://localhost:5001/api/v0/pin/add/{_hash}")
    return print(r.content)


def add_evidence(tx):
    def extract_nested(ipfs_uri):
        ipfs_hashes_list = list()
        data = _get_ipfs_data(ipfs_uri)
        j = json.loads(data)
        file_uri = j['fileURI']
        nested_hash = json.loads(_get_ipfs_data(file_uri))

        ipfs_hashes_list.append(ipfs_uri)
        ipfs_hashes_list.append(nested_hash['photo'])
        ipfs_hashes_list.append(nested_hash['video'])
        ipfs_hashes_list.append(file_uri)
        for _hash in ipfs_hashes_list:
            _hash = _hash.split("/")[2]
            add_hash(_hash)

    receipt = w3.eth.getTransaction(tx)
    decode = contract.decode_function_input(receipt.input)
    ipfs_uri = dict(decode[1])['_evidence']
    extract_nested(ipfs_uri)


if __name__ == '__main__':
    main()
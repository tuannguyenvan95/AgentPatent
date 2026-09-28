
from pathlib import Path
import json
import pytest

CONTRACT_PATH = Path(__file__).parent.parent / 'contracts' / 'contract.py'

def test_full_genvm_lifecycle(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(str(CONTRACT_PATH))
    assert contract is not None

    import sys
    Address = sys.modules['genlayer'].Address

    # 1. Check Initial Stats
    stats = json.loads(contract.get_stats())
    assert stats['total_patents'] == 0

    # 2. Register Patent
    direct_vm.sender = direct_alice
    direct_vm.value = 1000000000000000000  # 1 GEN
    pid = contract.register_patent_claim(
        'Novel Autonomous Consensus Protocol for Scientific Discovery',
        'We claim a multi-agent consensus protocol with subjective validity scoring and canary tokens.',
        1000
    )
    assert pid == 1

    # 3. Retrieve Patent
    p_data = json.loads(contract.get_patent(pid))
    assert p_data['patent_id'] == 1
    assert p_data['inventor'] == Address(direct_alice).as_hex.lower()
    assert p_data['status'] == 0

    # 4. Challenge Prior Art
    direct_vm.sender = direct_bob
    direct_vm.value = 100000000000000000  # 0.1 GEN (10%)
    contract.challenge_prior_art(
        pid,
        'https://arxiv.org/abs/2301.00001'
    )
    p_after_challenge = json.loads(contract.get_patent(pid))
    assert p_after_challenge['status'] == 1
    assert p_after_challenge['challenger'] == Address(direct_bob).as_hex.lower()

import os
import sys
import json
import time
from genlayer_py import create_client, create_account, studionet
from eth_account import Account

INVENTOR_PK = "0x1b807b1df022a40f872596b11565e6b6856547dc66996bd3d5a85b376ea3a0ef"
CONTRACT = "0xD91f5095151ab72DfF3d76905ffA49238cCa340f"

def main():
    print("=" * 70, flush=True)
    print("  GENLAYER ON-CHAIN AGENTPATENT COMPLETE LIFECYCLE AUDIT TEST  ", flush=True)
    print("=" * 70, flush=True)

    inv_acct = create_account(INVENTOR_PK)
    client = create_client(chain=studionet, account=inv_acct)

    print(f"[+] Inventor Address           : {inv_acct.address}", flush=True)
    bal_inv = client.get_balance(inv_acct.address)
    print(f"[+] Inventor Balance           : {bal_inv / 1e18:.4f} GEN", flush=True)
    print(f"[+] Target Contract Address    : {CONTRACT}", flush=True)

    # 1. Create a separate Challenger Account
    challenger_key = "0x" + os.urandom(32).hex()
    chal_acct = create_account(challenger_key)
    print(f"[+] Generated Challenger Address: {chal_acct.address}", flush=True)

    # Transfer 1.0 GEN from Inventor to Challenger for gas & bond
    print("[>>>] Funding Challenger with 1.0 GEN...", flush=True)
    fund_tx = client.send_transaction(
        account=inv_acct,
        to=chal_acct.address,
        value=int(1.0 * 1e18)
    )
    client.wait_for_transaction_receipt(fund_tx)
    chal_client = create_client(chain=studionet, account=chal_acct)
    chal_bal = chal_client.get_balance(chal_acct.address)
    print(f"[+] Challenger Funded! Balance : {chal_bal / 1e18:.4f} GEN", flush=True)

    # 2. Register a new Patent Claim
    title = "LoRA Parameter-Efficient Low-Rank Neural Adaptation"
    claims = "A method for adapting pre-trained language models by decomposing weight updates into low-rank rank-decomposition matrices A and B with intrinsic rank r much smaller than dimension d."
    deposit_wei = int(1.0 * 1e18) # 1.0 GEN escrow
    duration = 86400 # 24 hours

    print(f"\n[>>>] STEP 1: Registering Patent Claim (Escrow: 1.0 GEN)...", flush=True)
    reg_tx = client.write_contract(
        address=CONTRACT,
        function_name="register_patent_claim",
        account=inv_acct,
        value=deposit_wei,
        args=[title, claims, duration]
    )
    reg_receipt = client.wait_for_transaction_receipt(reg_tx)
    print(f"[+] Patent Registered! Tx: {reg_tx}", flush=True)

    # Read latest patent ID
    counter = client.read_contract(address=CONTRACT, function_name="get_stats")
    stats = json.loads(counter) if isinstance(counter, str) else counter
    total_patents = stats.get("total_patents", 0)
    pid = f"patent-{total_patents}"
    print(f"[+] Assigned Docket ID: #{pid} (Total Patents: {total_patents})", flush=True)

    raw_p = client.read_contract(address=CONTRACT, function_name="get_patent", args=[pid])
    p = json.loads(raw_p) if isinstance(raw_p, str) else raw_p
    print(f"[+] Registered Status: {p.get('status')} ({p.get('verdict')})", flush=True)
    print(f"[+] Inventor on record: {p.get('inventor')}", flush=True)

    # 3. Challenger Files Prior Art Collision Challenge
    prior_art_url = "https://raw.githubusercontent.com/microsoft/LoRA/main/README.md"
    bond_wei = deposit_wei // 10 # 0.1 GEN bond
    print(f"\n[>>>] STEP 2: Challenger ({chal_acct.address}) Staking Bond ({bond_wei / 1e18} GEN)...", flush=True)
    print(f"[>>>] Evidence URL: {prior_art_url}", flush=True)

    chal_tx = chal_client.write_contract(
        address=CONTRACT,
        function_name="challenge_prior_art",
        account=chal_acct,
        value=bond_wei,
        args=[pid, prior_art_url]
    )
    chal_receipt = chal_client.wait_for_transaction_receipt(chal_tx)
    print(f"[+] Challenge Filed! Tx: {chal_tx}", flush=True)

    raw_p_ch = client.read_contract(address=CONTRACT, function_name="get_patent", args=[pid])
    p_ch = json.loads(raw_p_ch) if isinstance(raw_p_ch, str) else raw_p_ch
    print(f"[+] Docket Status: {p_ch.get('status')} (STATUS_IN_EXAMINATION)", flush=True)
    print(f"[+] Challenger on record: {p_ch.get('challenger')}", flush=True)

    # 4. Trigger Autonomous AI Deliberation
    print(f"\n[>>>] STEP 3: Convening GenLayer Autonomous AI Patent Examination Board...", flush=True)
    print(f"[>>>] Calling adjudicate_collision({pid}) with multi-validator subjective consensus...", flush=True)

    adj_tx = client.write_contract(
        address=CONTRACT,
        function_name="adjudicate_collision",
        account=inv_acct,
        args=[pid]
    )
    print(f"[+] Adjudication Tx Submitted: {adj_tx}", flush=True)
    print("[+] Waiting for consensus (web fetch + LLM judgment + validator agreement)...", flush=True)
    adj_receipt = client.wait_for_transaction_receipt(adj_tx)
    print(f"[+] Adjudication Receipt Status: {adj_receipt.get('status') or adj_receipt.get('result')}", flush=True)

    # 5. Read Verdict & Cooling-Off Status
    raw_p_adj = client.read_contract(address=CONTRACT, function_name="get_patent", args=[pid])
    p_adj = json.loads(raw_p_adj) if isinstance(raw_p_adj, str) else raw_p_adj

    print("\n" + "=" * 70, flush=True)
    print("               ON-CHAIN AI JURY VERDICT RENDERED               ", flush=True)
    print("=" * 70, flush=True)
    print(f"Docket ID          : #{p_adj.get('patent_id')}", flush=True)
    print(f"Status Code        : {p_adj.get('status')} (2 = STATUS_AWAITING_PAYOUT)", flush=True)
    print(f"AI Verdict         : {p_adj.get('verdict')}", flush=True)
    print(f"Overlap Score      : {p_adj.get('overlap_score')} / 100", flush=True)
    print(f"Consensus Conf.    : {p_adj.get('confidence')} %", flush=True)
    print(f"Reasoning          : {p_adj.get('reason')}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    main()

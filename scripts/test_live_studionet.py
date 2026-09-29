import os
import sys
import json
import time
from genlayer_py import create_client, create_account, studionet

PK = "0x1b807b1df022a40f872596b11565e6b6856547dc66996bd3d5a85b376ea3a0ef"
CONTRACT = "0xD91f5095151ab72DfF3d76905ffA49238cCa340f"


def main():
    print("=" * 70, flush=True)
    print("  LIVE ON-CHAIN COLLISION AUDIT TEST ON GENLAYER STUDIONET  ", flush=True)
    print("=" * 70, flush=True)

    acct = create_account(PK)
    client = create_client(chain=studionet, account=acct)

    print(f"[+] Challenger Account Address : {acct.address}", flush=True)
    bal = client.get_balance(acct.address)
    print(f"[+] Challenger Current Balance : {bal / 1e18} GEN", flush=True)
    print(f"[+] Target Contract            : {CONTRACT}", flush=True)

    # 1. Read Current State of Patent #1
    raw_p1 = client.read_contract(address=CONTRACT, function_name="get_patent", args=[1])
    p1 = json.loads(raw_p1) if isinstance(raw_p1, str) else raw_p1
    print(f"[+] Patent #1 Current Status   : {p1.get('status')} ({p1.get('verdict')})", flush=True)
    print(f"[+] Patent #1 Title            : {p1.get('patent_title')}", flush=True)
    print(f"[+] Patent #1 Escrow Deposit   : {int(p1.get('escrow_deposit')) / 1e18} GEN", flush=True)

    status = int(p1.get("status", 0))

    if status == 0:
        # Step 2: Challenge with Prior Art
        prior_art_url = "https://raw.githubusercontent.com/microsoft/LoRA/main/README.md"
        bond_wei = int(p1.get("escrow_deposit")) // 10  # 10% bond = 0.35 GEN
        print(f"\n[>>>] Staking Challenger Bond ({bond_wei / 1e18} GEN) and Indicting Prior Art...", flush=True)
        print(f"[>>>] Evidence URL: {prior_art_url}", flush=True)

        tx_hash = client.write_contract(
            address=CONTRACT,
            function_name="challenge_prior_art",
            account=acct,
            value=bond_wei,
            args=[1, prior_art_url]
        )
        print(f"[+] Challenge Tx Submitted: {tx_hash}", flush=True)
        print("[+] Waiting for receipt...", flush=True)
        receipt = client.wait_for_transaction_receipt(tx_hash)
        print(f"[+] Challenge Tx Confirmed! Status: {receipt.get('status') or receipt.get('result')}", flush=True)

        # Re-check status
        raw_p1 = client.read_contract(address=CONTRACT, function_name="get_patent", args=[1])
        p1 = json.loads(raw_p1) if isinstance(raw_p1, str) else raw_p1
        print(f"[+] Updated Status: {p1.get('status')} - Challenger: {p1.get('challenger')}", flush=True)
        status = int(p1.get("status", 0))

    if status == 1:
        # Step 3: Convene Autonomous AI Patent Examination Board
        print("\n[>>>] Convening GenLayer Autonomous AI Patent Examination Board on-chain...", flush=True)
        print("[>>>] Calling adjudicate_collision(1)...", flush=True)

        tx_hash = client.write_contract(
            address=CONTRACT,
            function_name="adjudicate_collision",
            account=acct,
            args=[1]
        )
        print(f"[+] Adjudication Tx Submitted: {tx_hash}", flush=True)
        print("[+] Waiting for multi-validator AI consensus and proof generation (this may take 20-50s)...", flush=True)
        receipt = client.wait_for_transaction_receipt(tx_hash)
        print(f"[+] Adjudication Decree Enacted! Status: {receipt.get('status') or receipt.get('result')}", flush=True)

    # Final State Verification
    raw_final = client.read_contract(address=CONTRACT, function_name="get_patent", args=[1])
    final_p = json.loads(raw_final) if isinstance(raw_final, str) else raw_final

    print("\n" + "=" * 70, flush=True)
    print("               FINAL ON-CHAIN VERDICT & DECREE               ", flush=True)
    print("=" * 70, flush=True)
    print(f"Docket ID          : #{final_p.get('patent_id')}", flush=True)
    print(f"Status Code        : {final_p.get('status')}", flush=True)
    print(f"AI Verdict         : {final_p.get('verdict')}", flush=True)
    print(f"Overlap Score      : {final_p.get('overlap_score')} / 100", flush=True)
    print(f"Consensus Conf.    : {final_p.get('confidence')} %", flush=True)
    print(f"Cooling-Off Block  : {final_p.get('payout_ready_at_block')}", flush=True)
    print(f"Official Rationale : {final_p.get('reason')}", flush=True)
    print("=" * 70, flush=True)


if __name__ == "__main__":
    main()

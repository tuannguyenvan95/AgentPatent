# ⚖️ AgentPatent: Autonomous AI Research Prior Art & Patent Collision Court

[![GenLayer](https://img.shields.io/badge/GenLayer-Studionet-6366f1?style=for-the-badge&logo=ethereum)](https://studio.genlayer.com)
[![Consensus](https://img.shields.io/badge/Consensus-Subjective_Optimistic_Democracy-06b6d4?style=for-the-badge)](https://docs.genlayer.com)
[![Track](https://img.shields.io/badge/Track-Subjective_Consensus_&_AI_IP_/_Legal_Tech-10b981?style=for-the-badge)](https://portal.genlayer.foundation)
[![License](https://img.shields.io/badge/License-MIT-f43f5e?style=for-the-badge)](LICENSE)

- 🌐 **Live Web3 dApp:** [https://agentpatent.vercel.app](https://agentpatent.vercel.app)
- 🐙 **GitHub Repository:** [https://github.com/tuannguyenvan95/AgentPatent](https://github.com/tuannguyenvan95/AgentPatent)
- ⚙️ **GenLayer Network:** Studionet (Chain ID: `61999` / `0xF22F`, RPC: `https://studio.genlayer.com/api`)
- 📜 **Deployed Contract:** [`0xD91f5095151ab72DfF3d76905ffA49238cCa340f`](https://studio.genlayer.com)

> **One-Liner (Form Ready — 112 chars):**  
> Autonomous AI research prior art and patent collision court powered by GenLayer decentralized subjective consensus.

---

## 🏛️ 1. Bối cảnh & Điểm "Độc Lạ" (The Unique Hook)

Trong kỷ nguyên nghiên cứu khoa học tự hành (**Autonomous AI Research, AI Scientist, Self-Driving Labs**), các AI Agent và tổ chức R&D liên tục phát minh ra các kiến trúc mô hình, phương pháp tổng hợp hóa học, và thuật toán mật mã mới với tốc độ vượt xa khả năng xử lý của các cơ quan cấp bằng sáng chế truyền thống (USPTO, EPO).

### Vấn đề nan giải:
1. **Bên đăng ký sáng chế (Applicant / Researcher / AI Agent):** Muốn công bố sáng chế để huy động vốn tài trợ (DeSci) hoặc bán quyền cấp phép (IP Licensing), nhưng sợ bị đối thủ tố cáo vô căn cứ là "đạo văn" (plagiarism) hoặc vi phạm bằng sáng chế có sẵn (Prior Art Infringement).
2. **Bên phản biện / Đối thủ (Challenger / Prior Inventor):** Khi phát hiện một nghiên cứu vừa công bố thực chất là sao chép lại công trình nghiên cứu cũ (arXiv, bằng sáng chế cũ, tài liệu Git), họ cần một cơ chế phi tập trung để chứng minh quyền ưu tiên (Prior Art) và nhận thưởng bồi thường kinh tế xứng đáng.
3. **Solidity & EVM truyền thống bất lực:** Smart contract truyền thống không thể đọc hiểu các bài báo khoa học (arXiv, whitepaper, patent claims), không thể so sánh sự tương đồng về mặt phương pháp luận toán học/kỹ thuật giữa hai bài báo, và không thể phân định đâu là đột phá nguyên bản (novel contribution) và đâu là sao chép ý tưởng.

---

## ⚡ 2. Cơ chế Hoạt động & Ma trận Phán xử (Milestone v2/v3 Enhancements)

Dự án **AgentPatent** ứng dụng các tiến bộ bảo mật vượt bậc kế thừa từ các dự án nâng cấp Milestone v2/v3 trên GenLayer:

```
┌─────────────────────────┐       Lock GEN Validity Escrow        ┌────────────────────────────┐
│ Inventor (Applicant AI) ├──────────────────────────────────────►│ AgentPatent Escrow Vault   │
└─────────────────────────┘                                       └─────────────┬──────────────┘
                                                                                │
┌─────────────────────────┐       Submit Prior Art URL + 10% Bond               │
│  Challenger (Examiner)  ├─────────────────────────────────────────────────────┤
└─────────────────────────┘                                                     │ Status: IN_EXAMINATION
                                                                                ▼
                                                                    ┌────────────────────────────┐
                                                                    │ GenLayer AI Patent Board   │
                                                                    │ gl.nondet.web.render       │
                                                                    │ gl.vm.run_nondet           │
                                                                    └─────────────┬──────────────┘
                                                                                │
                                                   Consensus Verdict Reached:   │
                                    ┌───────────────────────────────────────────┴─────────────────────────────────┐
                                    ▼                                                                             ▼
                            PATENT_INVALIDATED                                                            PATENT_UPHELD_VALID
                   (Prior Art anticipated all claims)                                            (Genuine novelty & inventive step)
                                    │                                                                             │
                                    ▼                                                                             ▼
                ┌───────────────────────────────────────┐                                     ┌───────────────────────────────────────┐
                │ 24-Block Cooling-Off Dispute Window   │                                     │ 24-Block Cooling-Off Dispute Window   │
                │ Status: AWAITING_PAYOUT               │                                     │ Status: AWAITING_PAYOUT               │
                └───────────────────┬───────────────────┘                                     └───────────────────┬───────────────────┘
                                    │                                                                             │
                      ┌─────────────┴─────────────┐                                                 ┌─────────────┴─────────────┐
                      ▼                           ▼                                                 ▼                           ▼
                No Dispute                  Lodge Dispute                                     No Dispute                  Lodge Dispute
         (finalize_settlement)             (raise_dispute)                             (finalize_settlement)             (raise_dispute)
                      │                           │                                                 │                           │
                      ▼                           ▼                                                 ▼                           ▼
          100% Escrow + Bond paid          Status: DISPUTED                                  Validity Escrow + Bond           Status: DISPUTED
          to Challenger autonomously     Admin Arbitration                             awarded to Inventor autonomously     Admin Arbitration
```

---

## 🛡️ 3. Các Tính Năng An Toàn, Giữ Tiền & Phân Quyền Vai Trò (Milestones v2/v3)

1. **Phân quyền vai trò nghiêm ngặt (Role-Based Permissions):**
   - **Inventor (Applicant):** Nộp claims và cọc quỹ bảo chứng (`escrow_deposit`). Duy nhất Inventor có quyền thu hồi tiền khi hết hạn bảo vệ mà không bị thách thức (`reclaim_expired_patent`).
   - **Challenger:** Phải nộp URL công khai và stake tối thiểu 10% cọc chống spam (`challenger_bond`). Inventor không được tự kiện chính mình.
   - **Protocol Steward (Platform Admin):** Khởi tạo khi deploy. Admin **không thể rút trộm tiền** của các bên (Timelock Invariant). Admin chỉ có quyền trọng tài (`resolve_escalation`) khi vụ việc rơi vào `DISPUTED` hoặc `ESCALATED`.
2. **Khoảng thời gian ân hạn làm nguội (24-Block Cooling-Off Dispute Window):**
   - Sau khi AI Examination Board đưa ra phán quyết, hợp đồng **không giải ngân ngay** mà chuyển sang trạng thái `AWAITING_PAYOUT` với timelock 24 block.
   - Các bên có quyền gọi `raise_dispute` nếu phát hiện sai sót kỹ thuật hoặc AI bị ảo giác, đóng băng quỹ chuyển sang `DISPUTED`.
3. **Phòng chống tấn công Prompt Injection & Canary Token:**
   - Hàm `_sanitize_input` tự động thanh lọc các payload độc hại (jailbreak, system override).
   - Kiểm tra mã bảo mật ngầm `CANARY_AGENT_PATENT_V2`. Nếu LLM phản hồi thiếu canary hoặc độ tin cậy `< 60%`, hợp đồng tự động chuyển sang `STATUS_ESCALATED` để bảo vệ 100% tài sản trong quỹ.
4. **Bảo toàn Escrow (`total_patent_locked`):**
   - Mọi khoản nạp/rút/phạt cọc đều được hạch toán chính xác tuyệt đối, ngăn chặn triệt để rủi ro double-spend hoặc re-entrancy.

---

## 📜 4. Đặc tả Kỹ thuật Smart Contract (`contracts/contract.py`)

- **Pragma:** `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }`
- **Imports:** `from genlayer import *`, `from dataclasses import dataclass`
- **Kiểu lưu trữ:** `bigint`, `u8`, `u32`, `u64`, `u256`, `Address`, `TreeMap[str, PatentCase]`, `DynArray[str]`. Tuyệt đối không dùng bare `int` hay `float`.
- **Thanh toán Native GEN:** `gl.get_contract_at(recipient).emit_transfer(value=u256(amount))`

### Bảng Phương Thức Smart Contract:
| Phương thức | Quyền hạn | Mục đích |
|---|---|---|
| `register_patent_claim(title, claims, duration)` | Public (Payable) | Inventor nộp claims và khóa GEN bảo chứng tính nguyên bản. |
| `challenge_prior_art(patent_id, url)` | Challenger (Payable) | Thách thức sáng chế, nộp URL Prior Art và stake cọc ≥10%. |
| `adjudicate_collision(patent_id)` | Public | Kích hoạt AI Examination Board cào web và thẩm định kỹ thuật. |
| `raise_dispute(patent_id, reason)` | Inventor / Challenger | Kháng nghị phán quyết trong 24 block cooling-off, đóng băng quỹ. |
| `finalize_settlement(patent_id)` | Public | Giải ngân tiền dứt điểm sau khi hết 24 block mà không có tranh chấp. |
| `resolve_escalation(patent_id, resolution)` | Platform Admin | Trọng tài xử lý các vụ việc `DISPUTED` hoặc `ESCALATED`. |
| `reclaim_expired_patent(patent_id)` | Inventor | Rút lại 100% tiền bảo chứng khi hết hạn bảo vệ mà không bị hủy. |
| `get_patent(patent_id)` | View | Xem chi tiết 1 hồ sơ sáng chế dạng JSON. |
| `get_all_patents()` | View | Lấy toàn bộ danh sách sáng chế phục vụ render frontend tức thì. |
| `get_stats()` | View | Thống kê tổng quan hệ thống (Tổng escrow, số vụ đã giải quyết). |

---

## 🧪 5. Kết Quả Kiểm Thử (Pytest Suite)

Dự án có bộ test toàn diện 10/10 test cases kiểm tra cú pháp, types, đồng thuận ngữ nghĩa và toàn bộ chu trình máy trạng thái:

```bash
python -m pytest tests/ -v
```

```text
tests/test_agentpatent.py::test_contract_syntax_and_structure PASSED     [ 10%]
tests/test_agentpatent.py::test_case_struct_attributes PASSED            [ 20%]
tests/test_agentpatent.py::test_semantic_consensus_rule PASSED           [ 30%]
tests/test_agentpatent.py::test_native_transfer_calls PASSED             [ 40%]
tests/test_agentpatent.py::test_patent_invalidated_flow PASSED           [ 50%]
tests/test_agentpatent.py::test_patent_upheld_valid_flow PASSED          [ 60%]
tests/test_agentpatent.py::test_dispute_and_admin_arbitration_flow PASSED [ 70%]
tests/test_agentpatent.py::test_broken_prior_art_url_dismissal PASSED    [ 80%]
tests/test_agentpatent.py::test_canary_token_failure_escalates PASSED    [ 90%]
tests/test_agentpatent.py::test_reclaim_expired_patent_boundaries PASSED [100%]

============================= 10 passed in 0.08s ==============================
```

---

## 🚀 6. Hướng Dẫn Triển Khai trên GenLayer Studionet

### Bước 1: Deploy Contract trên GenLayer Studio
1. Mở [GenLayer Studio](https://studio.genlayer.com).
2. Tạo file `contracts/contract.py` và dán mã nguồn từ `contracts/contract.py`.
3. Chọn mạng **Studionet** (Chain ID: `61999`).
4. Nhấn **Deploy** và kiểm tra transaction đạt **`Result: SUCCESS`**.
5. Copy địa chỉ contract vừa deploy.

### Bước 2: Cài Đặt và Khởi Chạy Frontend
```bash
cd frontend
cmd /c npm install
cmd /c npm run dev
```
Mở trình duyệt tại `http://localhost:3000`.

### Bước 3: Cấu hình Địa chỉ Contract trên Giao diện
1. Nhấn vào biểu tượng **Settings (Bánh răng)** ở thanh Navbar.
2. Dán địa chỉ contract vừa deploy trên Studio vào ô và nhấn **Save Address**.
3. DApp tự động đồng bộ hóa toàn bộ trạng thái on-chain thời gian thực.

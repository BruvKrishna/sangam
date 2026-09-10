# SANGAM (संगम) — AI-Powered Automatic Block Planning Platform
### Smart India Hackathon 2026 Prototype
**Problem Statement ID:** SIH26027 — *“AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways”*  
**Ministry:** Ministry of Railways  
**Team Name:** SubwaySurfers  
**Solution Name:** SANGAM (संगम)  

---

## 📌 Executive Summary

**SANGAM** is an AI-assisted decision-support platform designed to automate and optimize the scheduling of maintenance traffic/power blocks across departments (Engineering, S&T, Traction/Electrical, General) for Indian Railways. 

By combining **AI-based multi-criteria task prioritization** with **Google OR-Tools CP-SAT constraint programming**, SANGAM generates mathematically optimal, conflict-free block plans while preserving human-in-the-loop approval workflows.

> ⚠️ **PROTOTYPE DISCLAIMER:**  
> This application is a **functional prototype** built for Smart India Hackathon 2026. It utilizes realistic **synthetic/demo data** and does **not** claim live integration with active Indian Railways operational production systems (TMS, SMMS, TDMS, COA, BDMS).

---

## ⚙️ Core Architecture & High-Level Workflow

```
[ Conceptual Railway Data Sources ]
(TMS | SMMS | TDMS | COA | BDMS)
                │
                ▼
[ Data Ingestion & Normalization Layer ]
                │
                ▼
[ AI Task Priority Engine ]
(Formula: 30% Criticality + 25% Urgency + 20% Overdue + 15% Asset Impact + 10% Safety)
                │
                ▼
[ Constraint Analysis & CP-SAT Optimization Engine ]
(Hard Constraints: Time Windows, Non-Overlap, Dependencies, Resource Limits)
(Soft Objectives: Maximize Priority, Overdue Bonus, Combine Compatible Tasks)
                │
                ▼
[ Conflict Detection & Resolution ] ──► [ What-If Scenario Analysis ]
                │
                ▼
[ Human-in-the-Loop Review & Approval ]
                │
                ▼
[ Finalized Block Plan & Reports ]
```

---

## 🧮 1. AI Priority Engine

SANGAM calculates a normalized **Priority Score (0–100)** for every maintenance task using a multi-factor weighted scoring model:

$$\text{Priority Score} = 0.30 \times \text{Criticality} + 0.25 \times \text{Urgency} + 0.20 \times \text{Overdue} + 0.15 \times \text{Asset Impact} + 0.10 \times \text{Safety Relevance}$$

*All components are normalized to a 0–100 scale.*

*Note: These weights are illustrative prototype weights designed to demonstrate multi-factor prioritization and do not represent official Indian Railways policy.*

### Explainability
For every task, SANGAM generates human-readable explanations explaining **why** it received its score (e.g., *"High task criticality (90/100) — critical for main line operations"* or *"Task is overdue — priority boosted"*).

---

## 🧩 2. Optimization Engine (Google OR-Tools CP-SAT)

SANGAM uses **Google OR-Tools CP-SAT (Constraint Programming - Satisfiability)** to transform prioritized tasks into a feasible, time-slotted block schedule.

### Hard Constraints:
1. **Permitted Windows:** Tasks must be scheduled within their preferred/permitted time window.
2. **Track Non-Overlap:** Incompatible cross-department tasks on the same railway section cannot overlap in time.
3. **Task Dependencies:** A dependent task cannot start until its prerequisite task has finished.
4. **Required Duration:** Block duration is strictly respected in 15-minute time slots across a 16-hour planning day (06:00 – 22:00).

### Soft Objectives (Maximization):
1. **Maximize Scheduled Priority:** Reward scheduling higher priority tasks first.
2. **Overdue Preference:** Bonus for scheduling overdue work early.
3. **Multi-Department Coordination:** Encourage grouping tasks belonging to shared compatibility groups (e.g., combining Engineering track tamping with S&T signal testing during a single line block).
4. **Disruption Minimization:** Penalize excessive block hours and unscheduled high-priority work.

---

## 🖥️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| **Optimization** | Google OR-Tools CP-SAT Solver |
| **Data Layer** | Modular In-Memory Data Store (Extensible to PostgreSQL / SQLAlchemy) |
| **Deployment** | Docker & Docker Compose |

---

## 📂 Project Structure

```
sangam/
├── frontend/
│   ├── src/
│   │   ├── api/client.js            # API client with automatic fallback
│   │   ├── components/
│   │   │   ├── common/              # StatusBadge, KPICard, DataTable, FilterBar, Modal
│   │   │   ├── charts/              # DepartmentChart, PriorityChart, BlockHoursChart, etc.
│   │   │   ├── layout/              # Sidebar, Header, Footer, AppLayout
│   │   │   └── planning/            # GanttChart, TaskSelector, TimelineView
│   │   ├── pages/                   # All 15 connected web application pages
│   │   ├── utils/constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── api/                     # 10 Route modules (tasks, assets, opt, whatif, etc.)
│   │   ├── data/                    # Synthetic data generator & DataStore singleton
│   │   ├── models/                  # Pydantic domain models (Task, Asset, Dept, etc.)
│   │   ├── optimization/            # CP-SAT constraint model engine
│   │   ├── priority_engine/         # Priority scorer & explainability service
│   │   ├── schemas/                 # Request & Response schemas
│   │   ├── services/                # Business logic services
│   │   └── main.py                  # FastAPI application entry point
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚦 How to Run SANGAM Locally

### Option A: Running with Python & Node (Recommended for local dev)

#### 1. Start Backend API
```bash
cd sangam/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend API documentation available at `http://localhost:8000/docs`*

#### 2. Start Frontend UI
```bash
cd sangam/frontend
npm install
npm run dev
```
*Frontend application available at `http://localhost:5173`*

---

### Option B: Running with Docker Compose

```bash
cd sangam
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 🎬 5–7 Minute SIH Prototype Demonstration Walkthrough

When presenting SANGAM to SIH judges or railway mentors, follow this structured demo flow:

1. **Dashboard Overview (1 min):**  
   Open `http://localhost:5173`. Show top-level KPI cards (Total Tasks: 66, Overdue: 18, Block Hours: 98.4h). Point out **AI Recommendations** highlighting multi-department coordination opportunities on Section SEC-A.

2. **Maintenance Tasks & AI Explainability (1 min):**  
   Navigate to **Maintenance Tasks**. Search/filter by department or section. Click a high-priority task (e.g. `ENG-005` or `SNT-003`) to open the **Task Detail** page. Explain the 5-factor priority score breakdown chart and the human-readable explanation section (*"Why was this task prioritized?"*).

3. **Block Planner & CP-SAT Optimization (1.5 min):**  
   Navigate to **Block Planner**. Select a planning date (`2026-09-10`). Click **Run Optimization**. Watch CP-SAT solve the constraint model in ~0.02 seconds. Inspect the interactive **Gantt Chart** showing color-coded scheduled blocks across departments with shared coordination slots.

4. **Conflict Detection & What-If Analysis (1 text/min):**  
   Navigate to **Conflict Center** to inspect detected overlapping tasks. Click **Open What-If**. Test a scenario (e.g. *Remove Task* or *Extend Block*). Click **Run Scenario** to see side-by-side metric comparison (Current vs New Plan delta indicators).

5. **Human Review & Approval (1 min):**  
   Navigate to **Review & Approval**. Demonstrate human-in-the-loop control: click **Approve** or **Reject** on proposed schedule blocks. Show how approved blocks update task statuses across the system.

6. **Reports & Architecture (0.5 min):**  
   Navigate to **Reports** to preview and export the *Daily Block Plan*. Conclude on **Data Sources & System About** to highlight conceptual railway integration (TMS/SMMS/TDMS) and team details.

---

## 🔮 Future Scope & Production Roadmap

- **Live Integration:** Secure REST/Kafka integration with COA, TMS, SMMS, and TDMS railway databases.
- **Dynamic Re-planning:** Real-time optimization updates triggered by train delays or sudden asset failures.
- **ML Failure Prediction:** Integrate predictive maintenance models to feed risk probabilities directly into urgency scores.
- **Enterprise Features:** Role-based access control (RBAC), divisional hierarchy support, and audit trail logs.

---

## 📄 License & Team Credits
Developed for **Smart India Hackathon 2026** by Team **SubwaySurfers**.  
*Prototype created for SIH Problem Statement SIH26027.*

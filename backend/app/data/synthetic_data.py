import random
from typing import List, Dict
from datetime import datetime, timedelta

random.seed(42)  # Reproducible demo data

SECTIONS = [
    {"id": "SEC-A", "name": "Delhi-Agra Section", "zone": "NCR"},
    {"id": "SEC-B", "name": "Mumbai-Pune Section", "zone": "CR"},
    {"id": "SEC-C", "name": "Chennai-Bengaluru Section", "zone": "SR"},
    {"id": "SEC-D", "name": "Howrah-Dhanbad Section", "zone": "ER"},
    {"id": "SEC-E", "name": "Ahmedabad-Vadodara Section", "zone": "WR"},
    {"id": "SEC-F", "name": "Nagpur-Bhusawal Section", "zone": "CR"},
]

DEPT_TASK_TEMPLATES = {
    "DEPT-ENG": [
        "Track Geometry Inspection",
        "Rail Flaw Detection (USFD)",
        "Ballast Packing & Tamping",
        "Rail Grinding",
        "Sleeper Replacement",
        "Weld Inspection",
        "Bridge Inspection",
        "Level Crossing Rehabilitation",
        "Drainage Clearing",
        "Formation Treatment",
        "Track Renewal Work",
        "Gauge Irregularity Correction",
    ],
    "DEPT-SNT": [
        "Signal Aspect Testing",
        "Relay Room Checking",
        "Point Motor Maintenance",
        "Track Circuit Testing",
        "Axle Counter Calibration",
        "Interlocking Testing",
        "Cable Route Inspection",
        "OFC Maintenance",
        "Level Crossing Gate Equipment Check",
        "Electronic Interlocking Health Check",
    ],
    "DEPT-TRC": [
        "OHE Mast Inspection",
        "Pantograph Examination",
        "Transformer Oil Testing",
        "Catenary Wire Tension Check",
        "Traction Substation Maintenance",
        "Power Cable Inspection",
        "Insulator Cleaning",
        "Lightning Arrester Testing",
        "Return Conductor Check",
        "Auto-Transformer Maintenance",
    ],
    "DEPT-GEN": [
        "Station Building Maintenance",
        "Platform Surface Repair",
        "Water Supply System Check",
        "Fire Safety Equipment Inspection",
    ],
}

ASSET_TEMPLATES = {
    "Track Section": {"prefix": "TRK", "dept": "DEPT-ENG"},
    "Signal": {"prefix": "SIG", "dept": "DEPT-SNT"},
    "Points/Switch": {"prefix": "PNT", "dept": "DEPT-SNT"},
    "OHE Equipment": {"prefix": "OHE", "dept": "DEPT-TRC"},
    "Traction Substation": {"prefix": "TSS", "dept": "DEPT-TRC"},
    "Communication Equipment": {"prefix": "COM", "dept": "DEPT-SNT"},
    "Level Crossing Gate": {"prefix": "LCG", "dept": "DEPT-ENG"},
    "Relay Room": {"prefix": "RLY", "dept": "DEPT-SNT"},
    "Bridge": {"prefix": "BRG", "dept": "DEPT-ENG"},
    "Station Building": {"prefix": "STN", "dept": "DEPT-GEN"},
}


def generate_departments() -> List[Dict]:
    return [
        {"id": "DEPT-ENG", "name": "Engineering", "description": "Civil engineering, permanent way, and track infrastructure maintenance", "head": "Chief Engineer (CE)"},
        {"id": "DEPT-SNT", "name": "S&T", "description": "Signal & Telecommunication systems maintenance and testing", "head": "Chief Signal & Telecom Engineer (CSTE)"},
        {"id": "DEPT-TRC", "name": "Traction/Electrical", "description": "Overhead equipment, traction power, and electrical infrastructure", "head": "Chief Electrical Engineer (CEE)"},
        {"id": "DEPT-GEN", "name": "General", "description": "General administration, station buildings, and support infrastructure", "head": "Divisional Railway Manager (DRM)"},
    ]


def generate_sections() -> List[Dict]:
    return SECTIONS


def generate_assets(sections: List[Dict]) -> List[Dict]:
    assets = []
    conditions = ["Good", "Good", "Good", "Fair", "Fair", "Poor", "Critical"]
    maintenance_statuses = ["Up to Date", "Up to Date", "Up to Date", "Due Soon", "Due Soon", "Overdue"]
    base_date = datetime(2026, 9, 10)
    
    idx = 1
    for asset_type, info in ASSET_TEMPLATES.items():
        count = random.randint(3, 5)
        for _ in range(count):
            sec = random.choice(sections)
            condition = random.choice(conditions)
            criticality = random.randint(40, 100) if condition in ("Poor", "Critical") else random.randint(20, 80)
            last_maint = base_date - timedelta(days=random.randint(5, 180))
            next_maint_offset = random.randint(-10, 60)
            next_maint = base_date + timedelta(days=next_maint_offset)
            maint_status = "Overdue" if next_maint_offset < 0 else ("Due Soon" if next_maint_offset < 14 else "Up to Date")
            
            assets.append({
                "id": f"AST-{idx:03d}",
                "type": asset_type,
                "section": sec["id"],
                "name": f"{info['prefix']}-{sec['id'][-1]}{idx:02d}",
                "description": f"{asset_type} at {sec['name']} ({sec['zone']} Zone)",
                "department_id": info["dept"],
                "criticality": criticality,
                "condition": condition,
                "last_maintenance": last_maint.strftime("%Y-%m-%d"),
                "next_maintenance": next_maint.strftime("%Y-%m-%d"),
                "maintenance_status": maint_status,
            })
            idx += 1
    
    return assets


def generate_tasks(departments: List[Dict], assets: List[Dict], sections: List[Dict]) -> List[Dict]:
    tasks = []
    dept_map = {d["id"]: d for d in departments}
    asset_map = {a["id"]: a for a in assets}
    
    statuses_weighted = ["pending"] * 40 + ["scheduled"] * 15 + ["in_progress"] * 5 + ["completed"] * 15 + ["overdue"] * 15 + ["cancelled"] * 5
    
    dates = [f"2026-09-{d:02d}" for d in range(10, 18)]
    
    dept_counters = {"ENG": 0, "SNT": 0, "TRC": 0, "GEN": 0}
    
    compatibility_groups = [
        {"id": "GRP-ENG-SNT-A", "depts": ["DEPT-ENG", "DEPT-SNT"], "label": "Track & Signal Combined Block"},
        {"id": "GRP-ENG-TRC-A", "depts": ["DEPT-ENG", "DEPT-TRC"], "label": "Track & OHE Combined Block"},
        {"id": "GRP-SNT-TRC-A", "depts": ["DEPT-SNT", "DEPT-TRC"], "label": "Signal & Electrical Combined Block"},
        {"id": "GRP-ENG-FULL", "depts": ["DEPT-ENG"], "label": "Engineering Block"},
        {"id": "GRP-SNT-FULL", "depts": ["DEPT-SNT"], "label": "S&T Block"},
    ]
    
    for dept_id, task_names in DEPT_TASK_TEMPLATES.items():
        dept_prefix = dept_id.split("-")[1]
        
        # Get assets for this department
        dept_assets = [a for a in assets if a.get("department_id") == dept_id]
        if not dept_assets:
            dept_assets = assets  # fallback
        
        num_tasks_for_dept = random.randint(15, 25) if dept_id != "DEPT-GEN" else random.randint(5, 8)
        
        for i in range(num_tasks_for_dept):
            dept_counters[dept_prefix] += 1
            task_num = dept_counters[dept_prefix]
            
            task_name = random.choice(task_names)
            asset = random.choice(dept_assets)
            sec_id = asset["section"]
            status = random.choice(statuses_weighted)
            
            # Generate realistic scores
            criticality = random.randint(30, 100)
            urgency = random.randint(20, 100)
            overdue_val = random.randint(50, 100) if status == "overdue" else (random.randint(0, 40) if random.random() > 0.3 else random.randint(40, 70))
            asset_impact = random.randint(30, 100)
            safety_relevance = random.randint(40, 100) if "Safety" in task_name or "Inspection" in task_name or "Testing" in task_name else random.randint(10, 70)
            
            pref_start = random.choice([6, 7, 8, 9, 10, 11, 12])
            duration_mins = random.choice([30, 45, 60, 90, 120, 150, 180, 240])
            pref_end = min(22, pref_start + max(4, (duration_mins // 60) + 3))
            
            planning_date = random.choice(dates)
            
            # Assign compatibility group to ~30% of tasks
            compat_group = None
            if random.random() < 0.3:
                eligible_groups = [g for g in compatibility_groups if dept_id in g["depts"]]
                if eligible_groups:
                    compat_group = random.choice(eligible_groups)["id"]
            
            tasks.append({
                "id": f"{dept_prefix}-{task_num:03d}",
                "name": task_name,
                "department_id": dept_id,
                "asset_id": asset["id"],
                "section": sec_id,
                "criticality": criticality,
                "urgency": urgency,
                "overdue_score": overdue_val,
                "asset_impact": asset_impact,
                "safety_relevance": safety_relevance,
                "required_duration_minutes": duration_mins,
                "preferred_window_start": pref_start,
                "preferred_window_end": pref_end,
                "status": status,
                "dependencies": [],
                "compatibility_group": compat_group,
                "planning_date": planning_date,
            })
    
    # Add dependencies: ~10% of tasks depend on another task from the same date/section
    for t in tasks:
        if random.random() < 0.1:
            candidates = [
                other for other in tasks
                if other["planning_date"] == t["planning_date"]
                and other["section"] == t["section"]
                and other["id"] != t["id"]
                and other["department_id"] != t["department_id"]
            ]
            if candidates:
                dep = random.choice(candidates)
                t["dependencies"].append(dep["id"])
    
    return tasks

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import routes
from app.api.routes_tasks import router as tasks_router
from app.api.routes_assets import router as assets_router
from app.api.routes_dashboard import router as dashboard_router
from app.api.routes_priority import router as priority_router
from app.api.routes_optimization import router as opt_router
from app.api.routes_conflicts import router as conflicts_router
from app.api.routes_whatif import router as whatif_router
from app.api.routes_approval import router as approval_router
from app.api.routes_reports import router as reports_router
from app.api.routes_departments import router as departments_router

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    from app.data.data_store import store
    # store is already initialized on import
    print(f"[SANGAM] Backend ready: {len(store.tasks)} tasks, {len(store.assets)} assets")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SANGAM API", "version": settings.VERSION}


@app.get("/api/sections")
def get_sections():
    from app.data.data_store import store
    return {"sections": store.sections}


@app.get("/api/data-sources")
def get_data_sources():
    """Conceptual data source information for the prototype."""
    return {
        "sources": [
            {
                "id": "TMS",
                "name": "Train Management System",
                "description": "Real-time train movement and timetable data",
                "data_types": ["Train schedules", "Track occupancy", "Speed restrictions"],
                "sync_status": "Simulated",
                "last_sync": "2026-09-10T06:00:00",
                "records": 15420,
            },
            {
                "id": "SMMS",
                "name": "Section Maintenance Management System",
                "description": "Maintenance activity records and work orders",
                "data_types": ["Work orders", "Maintenance history", "Inspection reports"],
                "sync_status": "Simulated",
                "last_sync": "2026-09-10T05:30:00",
                "records": 8750,
            },
            {
                "id": "TDMS",
                "name": "Track Data Management System",
                "description": "Track geometry and condition data",
                "data_types": ["Track geometry", "Rail wear", "Ballast condition"],
                "sync_status": "Simulated",
                "last_sync": "2026-09-10T04:00:00",
                "records": 23100,
            },
            {
                "id": "COA",
                "name": "Control Office Application",
                "description": "Section controller and traffic management data",
                "data_types": ["Block requests", "Traffic blocks", "Power blocks"],
                "sync_status": "Simulated",
                "last_sync": "2026-09-10T05:45:00",
                "records": 4200,
            },
            {
                "id": "BDMS",
                "name": "Bridge & Drainage Management System",
                "description": "Bridge inspection and maintenance records",
                "data_types": ["Bridge inspections", "Structural assessments", "Drainage status"],
                "sync_status": "Simulated",
                "last_sync": "2026-09-09T22:00:00",
                "records": 3600,
            },
        ],
        "pipeline": [
            {"step": 1, "name": "Data Adapter", "description": "Connects to each source system's data format"},
            {"step": 2, "name": "Normalization", "description": "Converts data to SANGAM's unified schema"},
            {"step": 3, "name": "Validation", "description": "Checks data quality, completeness, and consistency"},
            {"step": 4, "name": "SANGAM Database", "description": "Stores normalized maintenance and asset data"},
            {"step": 5, "name": "AI + Optimizer", "description": "Processes data for priority scoring and block planning"},
        ],
        "note": "These are conceptual data sources for the prototype. No live integration with railway systems is implemented.",
    }


# Include routers
app.include_router(tasks_router, prefix="/api")
app.include_router(assets_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(priority_router, prefix="/api")
app.include_router(opt_router, prefix="/api")
app.include_router(conflicts_router, prefix="/api")
app.include_router(whatif_router, prefix="/api")
app.include_router(approval_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(departments_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

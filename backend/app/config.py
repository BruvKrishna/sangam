from pydantic import BaseModel

class Config(BaseModel):
    PROJECT_NAME: str = "SANGAM Railway Block Planning Prototype"
    VERSION: str = "1.1"

settings = Config()

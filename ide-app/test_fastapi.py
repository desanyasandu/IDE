import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.delete("/workspace/{workspace_id}/files/{file_id:path}")
async def delete_file(workspace_id: str, file_id: str):
    return {"workspace_id": workspace_id, "file_id": file_id}

client = TestClient(app)
response = client.delete("/workspace/123/files/src%2FApp.tsx")
print("Encoded slash:", response.status_code, response.json() if response.status_code == 200 else response.text)

response = client.delete("/workspace/123/files/src/App.tsx")
print("Literal slash:", response.status_code, response.json() if response.status_code == 200 else response.text)

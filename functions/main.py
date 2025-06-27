import functions_framework
from flask import Request, jsonify
import firebase_admin
from firebase_admin import firestore
from pydantic import BaseModel, Field
import datetime
import uuid

# --- Initialize Firebase Admin SDK ---
# This is typically done once when the function instance starts.
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

# --- Data Models using Pydantic for Validation and Clarity ---

class ChecklistItem(BaseModel):
    id: str
    title: str
    description: str
    category: str

class PermitBlueprint(BaseModel):
    jurisdiction_name: str = Field(..., alias="jurisdictionName")
    agency_name: str = Field(..., alias="agencyName")
    agency_website: str = Field(..., alias="agencyWebsite")
    checklist_items: list[ChecklistItem] = Field(..., alias="checklistItems")

class ProjectChecklistItem(ChecklistItem):
    status: str = "not_started"

class ProjectChecklist(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    blueprint_id: str
    generated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    items: list[ProjectChecklistItem]

# --- Helper Function (Placeholder) ---

def get_jurisdiction_from_address(address: str) -> str:
    """
    Placeholder function to determine jurisdiction from an address.
    In a real application, this would use an API like Google Geocoding.
    """
    print(f"Geocoding address: {address}")
    # For now, we'll hardcode a response for demonstration.
    if "los angeles" in address.lower():
        return "los_angeles_county"
    return "default_county"

# --- Main Cloud Function ---

@functions_framework.http
def generate_permit_checklist(request: Request):
    """
    HTTP Cloud Function to generate a personalized permit checklist for a project.
    """
    if request.method != 'POST':
        return jsonify({"success": False, "error": "Method not allowed"}), 405

    request_json = request.get_json(silent=True)
    if not request_json or "projectId" not in request_json or "projectAddress" not in request_json:
        return jsonify({"success": False, "error": "Missing projectId or projectAddress"}), 400

    project_id = request_json["projectId"]
    project_address = request_json["projectAddress"]

    try:
        # 1. Determine jurisdiction from the address
        jurisdiction_id = get_jurisdiction_from_address(project_address)

        # 2. Fetch the Permit Blueprint from Firestore
        blueprint_ref = db.collection("permit_blueprints").document(jurisdiction_id)
        blueprint_doc = blueprint_ref.get()

        if not blueprint_doc.exists:
            return jsonify({"success": False, "error": f"No permit blueprint found for jurisdiction: {jurisdiction_id}"}), 404

        # Use Pydantic to parse and validate the blueprint data
        blueprint = PermitBlueprint.model_validate(blueprint_doc.to_dict())

        # 3. Create the personalized ProjectChecklist
        project_checklist_items = [
            ProjectChecklistItem(**item.model_dump()) for item in blueprint.checklist_items
        ]

        new_checklist = ProjectChecklist(
            blueprint_id=jurisdiction_id,
            items=project_checklist_items
        )

        # 4. Save the new checklist to Firestore
        checklist_ref = db.collection("projects").document(project_id).collection("checklists").document(new_checklist.id)
        # Use .model_dump() to get a dictionary representation of the Pydantic model
        checklist_ref.set(new_checklist.model_dump(by_alias=True))

        # 5. Return a success response
        return jsonify({
            "success": True,
            "message": "Checklist generated successfully.",
            "checklistId": new_checklist.id
        }), 201

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "error": "An internal error occurred."}), 500
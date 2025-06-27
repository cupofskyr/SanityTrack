
import os
from datetime import datetime, timezone

import functions_framework
import firebase_admin
from firebase_admin import firestore
from flask import jsonify
from pydantic import BaseModel, Field
from typing import List

# --- Firebase Initialization ---
# This is done once per function instance.
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

# --- Pydantic Data Models ---
# These models ensure data consistency and provide validation.

class ChecklistItemTemplate(BaseModel):
    """Template for a single item in a master permit blueprint."""
    id: str
    title: str
    description: str
    category: str

class ChecklistItem(ChecklistItemTemplate):
    """A checklist item instance for a specific project."""
    status: str = "not_started"

class PermitBlueprint(BaseModel):
    """The master template for a jurisdiction's permit process."""
    jurisdictionName: str = Field(alias="jurisdictionName")
    agencyName: str = Field(alias="agencyName")
    agencyWebsite: str = Field(alias="agencyWebsite")
    checklistItems: List[ChecklistItemTemplate] = Field(alias="checklistItems")

class ProjectChecklist(BaseModel):
    """The personalized checklist generated for a user's project."""
    blueprintId: str = Field(alias="blueprintId")
    generatedAt: datetime = Field(alias="generatedAt")
    items: List[ChecklistItem]

# --- Placeholder Logic ---

def get_jurisdiction_from_address(address: str) -> str:
    """
    Placeholder function to determine jurisdiction from an address.
    In a real implementation, this would call a geocoding API (e.g., Google Maps Geocoding API)
    to find the county for the given address.
    """
    print(f"Geocoding address (simulation): {address}")
    # For now, we'll return a hardcoded value for demonstration purposes.
    return "los_angeles_county"

# --- Main Cloud Function ---

@functions_framework.http
def generate_permit_checklist(request):
    """
    HTTP Cloud Function to generate a permit checklist for a new project.
    
    Args:
        request (flask.Request): The request object.
            <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        A JSON response with success status and the new checklist ID, or an error.
    """
    if request.method != 'POST':
        return jsonify({"success": False, "error": "Method not allowed"}), 405

    request_json = request.get_json(silent=True)
    if not request_json or 'projectId' not in request_json or 'projectAddress' not in request_json:
        return jsonify({"success": False, "error": "Missing projectId or projectAddress in request body"}), 400

    project_id = request_json['projectId']
    project_address = request_json['projectAddress']

    try:
        # 1. Determine jurisdiction from address
        jurisdiction_id = get_jurisdiction_from_address(project_address)
        if not jurisdiction_id:
            return jsonify({"success": False, "error": "Could not determine jurisdiction for the provided address."}), 404

        # 2. Fetch the permit blueprint from Firestore
        blueprint_ref = db.collection('permit_blueprints').document(jurisdiction_id)
        blueprint_doc = blueprint_ref.get()

        if not blueprint_doc.exists:
            return jsonify({"success": False, "error": f"No permit blueprint found for jurisdiction: {jurisdiction_id}"}), 404

        blueprint_data = blueprint_doc.to_dict()
        blueprint = PermitBlueprint(**blueprint_data)

        # 3. Create the personalized project checklist from the blueprint
        new_checklist_items = [ChecklistItem(**item.model_dump()) for item in blueprint.checklistItems]
        
        project_checklist = ProjectChecklist(
            blueprintId=jurisdiction_id,
            generatedAt=datetime.now(timezone.utc),
            items=new_checklist_items
        )

        # 4. Save the new checklist to the project's subcollection in Firestore
        # Using .document() without an ID will auto-generate a unique ID.
        new_checklist_ref = db.collection('projects').document(project_id).collection('checklists').document()
        
        # Use Pydantic's model_dump to get a dict suitable for Firestore
        new_checklist_ref.set(project_checklist.model_dump())

        # 5. Return a success response
        return jsonify({
            "success": True,
            "message": "Permit checklist generated successfully.",
            "checklistId": new_checklist_ref.id
        }), 201

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "error": "An internal error occurred."}), 500

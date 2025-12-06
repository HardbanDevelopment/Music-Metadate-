from fastapi import APIRouter, Body, Response
from typing import Dict
import xml.etree.ElementTree as ET

router = APIRouter(prefix="/ddex", tags=["ddex"])

@router.post("/export")
def export_ddex(metadata: Dict = Body(...)):
    # Dummy DDEX XML generation
    root = ET.Element("DDEXMessage")
    track = ET.SubElement(root, "Track")
    for key, value in metadata.items():
        ET.SubElement(track, key).text = str(value)
    xml_str = ET.tostring(root, encoding="utf-8")
    return Response(content=xml_str, media_type="application/xml")

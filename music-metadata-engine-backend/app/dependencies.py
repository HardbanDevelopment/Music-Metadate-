from fastapi import Depends, HTTPException, status
from app.routes.auth import get_current_user
from app.supabase_client import supabase
from gotrue.types import User

def get_user_and_check_quota(current_user: User = Depends(get_current_user)):
    """
    A dependency that gets the current user and checks if they have
    sufficient analysis quota.
    """
    user_metadata = current_user.user_metadata or {}
    analysis_count = user_metadata.get("analysis_count", 0)
    analysis_limit = user_metadata.get("analysis_limit", 10)

    if analysis_count >= analysis_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Quota exceeded. Limit: {analysis_limit}, Used: {analysis_count}"
        )
    
    return current_user

async def increment_user_quota(user_id: str):
    """
    Increments the analysis count for a given user.
    """
    try:
        # First, get the current count
        response = supabase.auth.admin.get_user_by_id(user_id)
        current_metadata = response.user.user_metadata or {}
        current_count = current_metadata.get("analysis_count", 0)
        
        # Then, update with the incremented count
        updated_metadata = {**current_metadata, "analysis_count": current_count + 1}
        supabase.auth.admin.update_user_by_id(
            user_id, {"user_metadata": updated_metadata}
        )
    except Exception as e:
        # Log this error, but don't block the user's request from completing
        print(f"CRITICAL: Failed to increment quota for user {user_id}. Error: {e}")


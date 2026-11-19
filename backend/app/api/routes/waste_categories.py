import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.waste_category import WasteCategoryRead, WasteCategoryCreate
from app.services.waste_category_service import WasteCategoryService, INITIAL_CATEGORIES

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/waste-categories", response_model=List[WasteCategoryRead])
def list_waste_categories(db: Session = Depends(get_db)):
    """
    Retrieve waste categories from database.
    """
    try:
        categories = WasteCategoryService.get_all(db)
        if not categories:
            return WasteCategoryService.seed_initial(db)
        return categories
    except Exception as exc:
        logger.error(f"Database query failed in list_waste_categories: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database offline: Unable to query waste categories ({exc})",
        )


@router.post("/waste-categories", response_model=WasteCategoryRead, status_code=status.HTTP_201_CREATED)
def create_waste_category(payload: WasteCategoryCreate, db: Session = Depends(get_db)):
    """
    Create a new waste category.
    """
    try:
        return WasteCategoryService.create(db, payload)
    except Exception as exc:
        logger.error(f"Error creating waste category: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create category: {str(exc)}",
        )

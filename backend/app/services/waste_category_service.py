from typing import List
from sqlalchemy.orm import Session
from app.models.waste_category import WasteCategory
from app.schemas.waste_category import WasteCategoryCreate

INITIAL_CATEGORIES = [
    {
        "name": "Organic",
        "description": "Biodegradable food scraps, garden waste, agricultural residues.",
        "recyclable": True,
        "handling_type": "composting",
    },
    {
        "name": "Plastic",
        "description": "Polymers including PET bottles, HDPE containers, LDPE films.",
        "recyclable": True,
        "handling_type": "recycling_plant",
    },
    {
        "name": "Paper",
        "description": "Cardboard, office paper, newsprint, packaging cartons.",
        "recyclable": True,
        "handling_type": "paper_mill",
    },
    {
        "name": "Metal",
        "description": "Ferrous and non-ferrous scrap, aluminum cans, steel containers.",
        "recyclable": True,
        "handling_type": "smelting",
    },
    {
        "name": "Construction",
        "description": "Concrete rubble, bricks, drywall, demolition debris.",
        "recyclable": False,
        "handling_type": "debris_crushing",
    },
    {
        "name": "Mixed",
        "description": "Non-segregated municipal solid waste requiring sorting.",
        "recyclable": False,
        "handling_type": "sorting_facility",
    },
]


class WasteCategoryService:
    @staticmethod
    def get_all(db: Session) -> List[WasteCategory]:
        return db.query(WasteCategory).order_by(WasteCategory.id).all()

    @staticmethod
    def create(db: Session, data: WasteCategoryCreate) -> WasteCategory:
        category = WasteCategory(**data.model_dump())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def seed_initial(db: Session) -> List[WasteCategory]:
        existing_count = db.query(WasteCategory).count()
        if existing_count == 0:
            seeded = []
            for item in INITIAL_CATEGORIES:
                cat = WasteCategory(**item)
                db.add(cat)
                seeded.append(cat)
            db.commit()
            for cat in seeded:
                db.refresh(cat)
            return seeded
        return db.query(WasteCategory).all()

from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base 

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allergies = Column(Text, nullable=True)
    current_conditions = Column(Text, nullable=True)
    past_conditions = Column(Text, nullable=True)

    user = relationship("User", back_populates="medical_records")

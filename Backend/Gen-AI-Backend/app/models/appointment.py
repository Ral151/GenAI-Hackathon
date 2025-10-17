from sqlalchemy import Column, Integer, String, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    share_hospital = Column(Boolean, default=False)
    share_emergency = Column(Boolean, default=False)
    status = Column(String, default="pending")  # e.g., pending, confirmed, cancelled
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="appointments")

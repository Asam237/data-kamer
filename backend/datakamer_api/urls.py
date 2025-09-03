from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegionViewSet, DepartmentViewSet, CompanyViewSet,
    JobDemandViewSet, SpecialtyViewSet, TouristSiteViewSet,
    UniversityViewSet, FacultyViewSet, UniversityGalleryViewSet
)

router = DefaultRouter()
router.register(r"regions", RegionViewSet)
router.register(r"departments", DepartmentViewSet)
router.register(r"companies", CompanyViewSet)
router.register(r"job-demands", JobDemandViewSet)
router.register(r"specialties", SpecialtyViewSet)
router.register(r"tourist-sites", TouristSiteViewSet)
router.register(r"universities", UniversityViewSet)
router.register(r"faculties", FacultyViewSet)
router.register(r"university-galleries", UniversityGalleryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]



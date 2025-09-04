from rest_framework import viewsets
from .models import (
    Region, Department, Company, JobDemand, Specialty, TouristSite,
    University, Faculty, UniversityGallery
)
from .serializers import (
    RegionSerializer, DepartmentSerializer, CompanySerializer,
    JobDemandSerializer, SpecialtySerializer, TouristSiteSerializer,
    UniversitySerializer, FacultySerializer, UniversityGallerySerializer
)


# ----------------------
# Région
# ----------------------
# Changer ReadOnlyModelViewSet par ModelViewSet pour autoriser le CRUD
class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class JobDemandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobDemand.objects.all()
    serializer_class = JobDemandSerializer


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer


class TouristSiteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TouristSite.objects.all()
    serializer_class = TouristSiteSerializer


# ----------------------
# Université
# ----------------------
class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer


class FacultyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer


class UniversityGalleryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UniversityGallery.objects.all()
    serializer_class = UniversityGallerySerializer


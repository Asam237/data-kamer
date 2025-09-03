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
class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class JobDemandViewSet(viewsets.ModelViewSet):
    queryset = JobDemand.objects.all()
    serializer_class = JobDemandSerializer


class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer


class TouristSiteViewSet(viewsets.ModelViewSet):
    queryset = TouristSite.objects.all()
    serializer_class = TouristSiteSerializer


# ----------------------
# Université
# ----------------------
class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer


class UniversityGalleryViewSet(viewsets.ModelViewSet):
    queryset = UniversityGallery.objects.all()
    serializer_class = UniversityGallerySerializer


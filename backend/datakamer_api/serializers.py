from rest_framework import serializers
from .models import (
    Region, Department, Company, JobDemand, Specialty, TouristSite,
    University, Faculty, UniversityGallery
)


# ----------------------
# Région
# ----------------------
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


class JobDemandSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDemand
        fields = "__all__"


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = "__all__"


class TouristSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TouristSite
        fields = "__all__"


class RegionSerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True, read_only=True)
    major_companies = CompanySerializer(many=True, read_only=True)
    job_demands = JobDemandSerializer(many=True, read_only=True)
    specialties = SpecialtySerializer(read_only=True)
    tourist_sites = TouristSiteSerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = "__all__"


# ----------------------
# Université
# ----------------------
class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = "__all__"


class UniversityGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityGallery
        fields = "__all__"


class UniversitySerializer(serializers.ModelSerializer):
    faculties = FacultySerializer(many=True, read_only=True)
    gallery_images = UniversityGallerySerializer(many=True, read_only=True)

    class Meta:
        model = University
        fields = "__all__"


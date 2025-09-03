from django.db import models


# ----------------------
# Région
# ----------------------
class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    capital = models.CharField(max_length=100)
    population = models.PositiveIntegerField()
    area = models.PositiveIntegerField(help_text="Superficie en km²")
    main_image = models.ImageField(upload_to="regions/", blank=True, null=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(Region, related_name="departments", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.region.name})"


class Company(models.Model):
    name = models.CharField(max_length=150)
    sector = models.CharField(max_length=100)
    region = models.ForeignKey(Region, related_name="major_companies", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} - {self.sector}"


class JobDemand(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(Region, related_name="job_demands", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.region.name})"


class Specialty(models.Model):
    region = models.OneToOneField(Region, related_name="specialties", on_delete=models.CASCADE)
    gastronomy = models.TextField(blank=True, null=True)
    professions = models.TextField(blank=True, null=True)
    entertainment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Spécialités de {self.region.name}"


class TouristSite(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True, null=True)
    image = models.ImageField(upload_to="tourist_sites/", blank=True, null=True)
    region = models.ForeignKey(Region, related_name="tourist_sites", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.region.name})"


# ----------------------
# Université
# ----------------------
class University(models.Model):
    PUBLIC = "Public"
    PRIVATE = "Privée"
    UNIVERSITY_TYPES = [
        (PUBLIC, "Université publique"),
        (PRIVATE, "Université privée"),
    ]

    name = models.CharField(max_length=200)
    region = models.ForeignKey(Region, related_name="universities", on_delete=models.CASCADE)
    founded = models.PositiveIntegerField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=UNIVERSITY_TYPES, default=PUBLIC)
    students = models.PositiveIntegerField(default=0)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    main_image = models.ImageField(upload_to="universities/", blank=True, null=True)

    def __str__(self):
        return self.name


class Faculty(models.Model):
    name = models.CharField(max_length=150)
    university = models.ForeignKey(University, related_name="faculties", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.university.name})"


class UniversityGallery(models.Model):
    image = models.ImageField(upload_to="universities/gallery/")
    university = models.ForeignKey(University, related_name="gallery_images", on_delete=models.CASCADE)

    def __str__(self):
        return f"Image de {self.university.name}"


import json
from django.core.management.base import BaseCommand
from django.db import transaction
from datakamer_api.models import (
    Region, Department, Company, JobDemand, Specialty, TouristSite,
    University, Faculty, UniversityGallery
)
import os

class Command(BaseCommand):
    help = 'Loads data from cameroon.json into the database'

    def handle(self, *args, **options):
        # Chemin vers le fichier JSON
        json_file_path = 'cameroon.json'

        if not os.path.exists(json_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {json_file_path}'))
            return

        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Utilisation d'une transaction pour garantir l'atomicité des opérations
        with transaction.atomic():
            self.stdout.write(self.style.NOTICE('Deleting old data...'))
            # Suppression des données existantes pour éviter les doublons
            Region.objects.all().delete()
            University.objects.all().delete()
            # Les autres modèles sont supprimés en cascade grâce à on_delete=models.CASCADE

            self.stdout.write(self.style.SUCCESS('Old data deleted successfully.'))
            self.stdout.write(self.style.NOTICE('Loading new data...'))

            # -------------------
            # 1. Chargement des régions
            # -------------------
            regions_data = data.get("regions", [])
            for region_item in regions_data:
                region = Region.objects.create(
                    name=region_item["name"],
                    capital=region_item["capital"],
                    population=region_item["population"],
                    area=region_item["area"],
                    main_image=region_item.get("mainImage", "")
                )
                self.stdout.write(f'Created Region: {region.name}')

                # Chargement des départements
                for department_name in region_item.get("departments", []):
                    Department.objects.create(name=department_name, region=region)
                    self.stdout.write(f'- Created Department: {department_name}')

                # Chargement des grandes entreprises
                for company_item in region_item.get("majorCompanies", []):
                    Company.objects.create(
                        name=company_item["name"],
                        sector=company_item["sector"],
                        region=region
                    )
                    self.stdout.write(f'- Created Company: {company_item["name"]}')

                # Chargement des demandes d'emploi
                for job_demand_name in region_item.get("jobDemand", []):
                    JobDemand.objects.create(name=job_demand_name, region=region)
                    self.stdout.write(f'- Created Job Demand: {job_demand_name}')

                # Chargement des spécialités (relation OneToOne)
                specialty_data = region_item.get("specialties")
                if specialty_data:
                    Specialty.objects.create(
                        region=region,
                        gastronomy=specialty_data.get("gastronomy"),
                        professions=specialty_data.get("professions"),
                        entertainment=specialty_data.get("entertainment")
                    )
                    self.stdout.write(f'- Created Specialty for {region.name}')

                # Chargement des sites touristiques
                for tourist_site_item in region_item.get("touristSites", []):
                    TouristSite.objects.create(
                        name=tourist_site_item["name"],
                        description=tourist_site_item["description"],
                        location=tourist_site_item.get("location"),
                        image=tourist_site_item.get("image"),
                        region=region
                    )
                    self.stdout.write(f'- Created Tourist Site: {tourist_site_item["name"]}')

            # -------------------
            # 2. Chargement des universités
            # -------------------
            universities_data = data.get("universities", [])
            for university_item in universities_data:
                # Recherche de l'objet Region correspondant
                region_name = university_item.get("region")
                try:
                    region = Region.objects.get(name=region_name)
                except Region.DoesNotExist:
                    self.stdout.write(self.style.WARNING(
                        f'Region "{region_name}" not found for university "{university_item["name"]}". Skipping.'
                    ))
                    continue

                university = University.objects.create(
                    name=university_item["name"],
                    region=region,
                    founded=university_item.get("founded"),
                    type=university_item.get("type"),
                    students=university_item.get("students", 0),
                    website=university_item.get("website"),
                    description=university_item.get("description"),
                    main_image=university_item.get("mainImage")
                )
                self.stdout.write(f'Created University: {university.name}')

                # Chargement des facultés
                for faculty_name in university_item.get("faculties", []):
                    Faculty.objects.create(name=faculty_name, university=university)
                    self.stdout.write(f'- Created Faculty: {faculty_name}')

                # Chargement de la galerie d'images
                for image_path in university_item.get("galleryImages", []):
                    UniversityGallery.objects.create(image=image_path, university=university)
                    self.stdout.write(f'- Created Gallery Image: {image_path}')

        self.stdout.write(self.style.SUCCESS('Data loaded successfully!'))

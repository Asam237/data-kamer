/**
 * Adapte les données statiques de data/cameroon.json vers les interfaces
 * consommées par l'application (RegionsView, UniversitiesView, ...).
 *
 * Remplace l'ancienne source de données distante (API Django) : tout est
 * désormais servi localement, de façon synchrone, à partir du JSON embarqué.
 */
import cameroonData from "../../data/cameroon.json";
import type {
  Region,
  Department,
  Company,
  JobDemand,
  Specialty,
  TouristSite,
} from "@/services/regions.service";
import type {
  University,
  Faculty,
  UniversityGallery,
} from "@/services/universities.service";

let regionsCache: Region[] | null = null;
let universitiesCache: University[] | null = null;

const buildRegions = (): Region[] =>
  cameroonData.regions.map((region: any): Region => {
    const departments: Department[] = (region.departments ?? []).map(
      (name: string, idx: number) => ({
        id: region.id * 1000 + idx + 1,
        name,
        region: region.id,
      })
    );

    const major_companies: Company[] = (region.majorCompanies ?? []).map(
      (company: any, idx: number) => ({
        id: region.id * 1000 + idx + 1,
        name: company.name,
        sector: company.sector,
        region: region.id,
      })
    );

    const job_demands: JobDemand[] = (region.jobDemand ?? []).map(
      (name: string, idx: number) => ({
        id: region.id * 1000 + idx + 1,
        name,
        region: region.id,
      })
    );

    const specialties: Specialty | undefined = region.specialties
      ? {
          id: region.id,
          region: region.id,
          gastronomy: region.specialties.gastronomy,
          professions: region.specialties.professions,
          entertainment: region.specialties.entertainment,
        }
      : undefined;

    const tourist_sites: TouristSite[] = (region.touristSites ?? []).map(
      (site: any, idx: number) => ({
        id: region.id * 1000 + idx + 1,
        name: site.name,
        description: site.description,
        location: site.location,
        image: site.image,
        region: region.id,
      })
    );

    return {
      id: region.id,
      name: region.name,
      capital: region.capital,
      population: region.population,
      area: region.area,
      main_image: region.mainImage,
      departments,
      major_companies,
      job_demands,
      specialties,
      tourist_sites,
    };
  });

const buildUniversities = (regions: Region[]): University[] =>
  cameroonData.universities.map((uni: any): University => {
    const region = regions.find((r) => r.name === uni.region);

    const faculties: Faculty[] = (uni.faculties ?? []).map(
      (name: string, idx: number) => ({
        id: uni.id * 1000 + idx + 1,
        name,
        university: uni.id,
      })
    );

    const gallery_images: UniversityGallery[] = (uni.galleryImages ?? []).map(
      (image: string, idx: number) => ({
        id: uni.id * 1000 + idx + 1,
        image,
        university: uni.id,
      })
    );

    return {
      id: uni.id,
      name: uni.name,
      region: region ? region.id : 0,
      founded: uni.founded,
      type: uni.type,
      students: uni.students ?? 0,
      website: uni.website,
      description: uni.description,
      main_image: uni.mainImage,
      faculties,
      gallery_images,
    };
  });

export const getLocalRegions = (): Region[] => {
  if (!regionsCache) regionsCache = buildRegions();
  return regionsCache;
};

export const getLocalUniversities = (): University[] => {
  if (!universitiesCache) {
    universitiesCache = buildUniversities(getLocalRegions());
  }
  return universitiesCache;
};

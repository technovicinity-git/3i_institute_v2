import { useQuery } from "@tanstack/react-query";
import { siteService } from "@/services/site.service";

export function useSiteStats() {
  return useQuery({
    queryKey: ["site-stats"],
    queryFn: siteService.getStats,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFaculty() {
  return useQuery({
    queryKey: ["site-faculty"],
    queryFn: siteService.getFaculty,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["site-testimonials"],
    queryFn: siteService.getTestimonials,
    staleTime: 10 * 60 * 1000,
  });
}

import { apiClient } from "@/lib/api-client";

export interface WishlistCourse {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  minimumAge: number;
  instructor: {
    id: string;
    name: string;
  };
  averageRating: number | null;
  ratingCount: number;
  enrolmentCount: number;
  format: string;
}

export interface WishlistItem {
  wishlistItemId: string;
  addedAt: string;
  course: WishlistCourse;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

export const wishlistService = {
  getWishlist: async (learnerProfileId: string): Promise<WishlistResponse> => {
    const response = await apiClient.get(
      `/wishlist?learnerProfileId=${learnerProfileId}`,
    );
    return response.data.data;
  },

  addToWishlist: async (
    learnerProfileId: string,
    courseId: string,
  ): Promise<void> => {
    await apiClient.post("/wishlist", { learnerProfileId, courseId });
  },

  removeFromWishlist: async (
    learnerProfileId: string,
    courseId: string,
  ): Promise<void> => {
    await apiClient.delete("/wishlist", {
      data: { learnerProfileId, courseId },
    });
  },
};

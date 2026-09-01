import { apiClient } from "@/lib/api-client";

export interface InstructorRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  locale: string;
  bio: string;
  areaOfExpertise: string;
  cvFile?: File;
  wwccNumber?: string;
  wwccState?: string;
  wwccExpiry?: string;
}

export const instructorRegistrationService = {
  register: async (input: InstructorRegistrationInput) => {
    // First upload CV if provided
    let cvUrl: string | undefined;

    if (input.cvFile) {
      const formData = new FormData();
      formData.append("image", input.cvFile);
      formData.append("folder", "instructors");

      const uploadResponse = await apiClient.post("/uploads/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cvUrl = uploadResponse.data.data.url;
    }

    // Register account + application
    const response = await apiClient.post("/auth/register/instructor", {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
      dateOfBirth: input.dateOfBirth,
      locale: input.locale,
      bio: input.bio,
      areaOfExpertise: input.areaOfExpertise,
      cvUrl: cvUrl || "https://placeholder.com/cv.pdf",
      wwccNumber: input.wwccNumber || "",
      wwccState: input.wwccState || "",
      wwccExpiry: input.wwccExpiry || "",
    });

    return response.data.data;
  },
};

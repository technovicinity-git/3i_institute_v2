"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, ChevronDown, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useInstructorRegistrationMutation } from "@/hooks/use-instructor-registration";

const instructorRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  locale: z.string().min(1, "Locale is required"),
  bio: z.string().min(20, "Please write at least 20 characters").max(2000),
  areaOfExpertise: z.string().min(3, "Area of expertise is required").max(500),
  wwccNumber: z.string().max(50).optional().or(z.literal("")),
  wwccState: z.string().max(50).optional().or(z.literal("")),
  wwccExpiry: z.string().optional().or(z.literal("")),
});

type InstructorRegistrationFormData = z.infer<
  typeof instructorRegistrationSchema
>;

const LOCALES = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bengali" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
  { value: "ar", label: "Arabic" },
];

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function InstructorRegistrationPage() {
  const router = useRouter();
  const registrationMutation = useInstructorRegistrationMutation();

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorRegistrationFormData>({
    resolver: zodResolver(instructorRegistrationSchema),
    defaultValues: {
      locale: "en",
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("CV must be under 5MB");
        return;
      }
      setCvFile(file);
    } else {
      toast.error("Only PDF files are allowed");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("CV must be under 5MB");
        return;
      }
      setCvFile(file);
    }
  };

  const removeCv = () => {
    setCvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (data: InstructorRegistrationFormData) => {
    if (!cvFile) {
      toast.error("Please upload your CV");
      return;
    }

    registrationMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        locale: data.locale,
        bio: data.bio,
        areaOfExpertise: data.areaOfExpertise,
        cvFile,
        wwccNumber: data.wwccNumber || undefined,
        wwccState: data.wwccState || undefined,
        wwccExpiry: data.wwccExpiry || undefined,
      },
      {
        onSuccess: () => {
          router.push(
            `/instructor/verify-email?email=${encodeURIComponent(data.email)}`,
          );
        },
      },
    );
  };

  return (
    <div
      className="min-h-screen bg-[#FBF9F4]"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      {/* Header */}
      <header className="flex items-center justify-center h-[92px] bg-white border-b border-[#E3E8EF]">
        <div className="w-11 h-11 rounded-full bg-[#157A34] flex items-center justify-center">
          <span className="text-white font-bold text-lg">3i</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[640px] mx-auto px-4 py-14">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1
            className="text-[40px] leading-[48px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Apply to teach at 3i
          </h1>
          <p className="mt-3 text-base text-[#475569]">
            Create your account and submit your teaching application in one
            step.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate
        >
          {/* Card: Your Account */}
          <div className="bg-white border border-[#E3E8EF] rounded-xl p-8">
            <h2
              className="text-[32px] leading-[38px] text-[#0C1F33] mb-6"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Your account
            </h2>

            <div className="space-y-5">
              {/* First Name */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    First name
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  {...register("firstName")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Last name
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  {...register("lastName")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Email
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Password
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
                <p className="text-[13px] text-[#475569]">
                  At least 10 characters
                </p>
                {errors.password && (
                  <p className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Date of birth
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-red-600">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              {/* Locale */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Locale
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <div className="relative">
                  <select
                    {...register("locale")}
                    className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] appearance-none pr-10 text-[#0C1F33]"
                  >
                    {LOCALES.map((locale) => (
                      <option key={locale.value} value={locale.value}>
                        {locale.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#475569] pointer-events-none" />
                </div>
                <p className="text-[13px] text-[#475569]">
                  Available options: English, Bengali, Hindi, Urdu, Arabic
                </p>
              </div>
            </div>
          </div>

          {/* Card: Teaching Application */}
          <div className="bg-white border border-[#E3E8EF] rounded-xl p-8">
            <h2
              className="text-[32px] leading-[38px] text-[#0C1F33] mb-6"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Teaching application
            </h2>

            <div className="space-y-5">
              {/* Bio */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Tell us about yourself
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Share your background, teaching philosophy, and why you want to join 3i..."
                  {...register("bio")}
                  className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] resize-none min-h-[120px] text-[#0C1F33]"
                />
                {errors.bio && (
                  <p className="text-xs text-red-600">{errors.bio.message}</p>
                )}
              </div>

              {/* Area of Expertise */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Area of expertise
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Creative Arts, Software Engineering"
                  {...register("areaOfExpertise")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
                {errors.areaOfExpertise && (
                  <p className="text-xs text-red-600">
                    {errors.areaOfExpertise.message}
                  </p>
                )}
              </div>

              {/* CV Upload */}
              <div className="space-y-[7px]">
                <label className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[#0C1F33]">
                    Upload your CV
                  </span>
                  <span className="text-base font-semibold text-[#157A34]">
                    *
                  </span>
                </label>

                {cvFile ? (
                  <div className="flex items-center justify-between border border-[#22A146] bg-green-50 rounded-lg p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0C1F33]">
                        {cvFile.name}
                      </p>
                      <p className="text-xs text-[#475569] mt-0.5">
                        {(cvFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCv}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-2 py-8 px-4 border rounded-lg cursor-pointer transition-colors ${
                      isDragging
                        ? "border-[#22A146] bg-green-50"
                        : "border-[#E3E8EF] bg-[#FBF9F4]"
                    }`}
                  >
                    <Upload className="w-6 h-6 text-[#475569]" />
                    <div className="text-center">
                      <p className="text-base font-semibold text-[#0C1F33]">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[13px] text-[#475569] mt-1">
                        PDF only (Max 5MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {/* WWCC Number */}
              <div className="space-y-[7px]">
                <label className="text-base font-semibold text-[#0C1F33]">
                  WWCC number
                </label>
                <input
                  type="text"
                  placeholder="Working with Children Check Number"
                  {...register("wwccNumber")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
              </div>

              {/* Issuing State */}
              <div className="space-y-[7px]">
                <label className="text-base font-semibold text-[#0C1F33]">
                  Issuing state
                </label>
                <div className="relative">
                  <select
                    {...register("wwccState")}
                    className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] appearance-none pr-10 text-[#0C1F33]"
                  >
                    <option value="">Select state</option>
                    {AUSTRALIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#475569] pointer-events-none" />
                </div>
              </div>

              {/* WWCC Expiry Date */}
              <div className="space-y-[7px]">
                <label className="text-base font-semibold text-[#0C1F33]">
                  WWCC expiry date
                </label>
                <input
                  type="date"
                  {...register("wwccExpiry")}
                  className="w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-5">
            <button
              type="submit"
              disabled={registrationMutation.isPending}
              className="w-full h-12 bg-[#22A146] hover:bg-[#1B8A3A] text-[#0C1F33] font-semibold text-[15px] rounded-lg transition-colors disabled:opacity-50"
            >
              {registrationMutation.isPending
                ? "Submitting..."
                : "Submit application"}
            </button>
            <p className="text-center text-[13px] text-[#475569]">
              Already have an account?{" "}
              <a
                href="/instructor/login"
                className="text-[#157A34] font-semibold hover:underline"
              >
                Log in
              </a>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

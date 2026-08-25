import Header from "@/components/profile/Header";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4]">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

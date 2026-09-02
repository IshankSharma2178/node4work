import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { email } = await searchParams;

  return <VerifyEmailForm email={email ?? null} />;
};

export default Page;

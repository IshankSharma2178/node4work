import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-muted relative flex min-h-sh flex-col justify-center items-center gap-6 p-6 md:p-10">
      <div className="absolute end-4 top-4 md:end-6 md:top-6">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src="/logo.svg" alt="Nodebase" width={30} height={30} />
          Nodebase
        </Link>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

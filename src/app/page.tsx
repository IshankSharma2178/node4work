import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";

const page = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      protected
      {JSON.stringify(data)}
      <LogoutButton />
    </div>
  );
};

export default page;

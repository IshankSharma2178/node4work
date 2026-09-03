import AppHeader from "@/components/app-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppHeader />
      <div className="flex-1">{children}</div>
    </>
  );
};
export default Layout;

"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  MoonIcon,
  StarIcon,
  SunIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWorkflowUsage } from "@/features/workflows/hooks/use-workflows";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  {
    title: "Main",
    items: [
      {
        title: "Workflows",
        icon: FolderOpenIcon,
        url: "/workflows",
      },
      {
        title: "Credentials",
        icon: KeyIcon,
        url: "/credentials",
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        url: "/executions",
      },
    ],
  },
];

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { data: usage, isLoading } = useWorkflowUsage();
  const {
    mounted: themeMounted,
    isDark,
    toggle: toggleTheme,
  } = useThemeToggle();

  const isPremium = usage?.isPremium ?? false;
  const workflowCount = usage?.workflowCount ?? 0;
  const freeLimit = usage?.freeLimit ?? 3;
  const usedPercent = Math.round((workflowCount / freeLimit) * 100);
  const atLimit = workflowCount >= freeLimit;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href="/" prefetch>
              <Image src="/logo.svg" alt="Nodebase" width={30} height={30} />
              <span className="font-semibold text-sm">Nodebase</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={
                        item.url === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.url)
                      }
                      asChild
                      className="gap-x-4 h-10 px-4"
                    >
                      <Link href={item.url} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {!isLoading && (
          <div className="mx-4 mb-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2.5">
            {isPremium ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Workflows</span>
                <Badge variant="secondary">Pro · Unlimited</Badge>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Workflows</span>
                  <span className="font-medium">
                    {workflowCount} of {freeLimit}
                  </span>
                </div>
                <Progress value={usedPercent} className="mt-2 h-1.5" />
                {atLimit && (
                  <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                    Free limit reached — upgrade for unlimited workflows.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={isDark ? "Light mode" : "Dark mode"}
              className="gap-x-4 h-10 px-4"
              disabled={!themeMounted}
              onClick={() => toggleTheme()}
            >
              {themeMounted ? (
                isDark ? (
                  <SunIcon className="size-4" />
                ) : (
                  <MoonIcon className="size-4" />
                )
              ) : (
                <SunIcon className="size-4 opacity-0" />
              )}
              <span>
                {themeMounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {!isPremium && !isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Upgrade to Pro"
                className="gap-x-4 h-10 px-4"
                onClick={() =>
                  authClient.checkout({
                    slug: "Nodebase-Pro",
                  })
                }
              >
                <StarIcon className="h-4 w-4" />
                <span>Upgrade to Pro</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Billing Portal"
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.customer.portal()}
            >
              <CreditCardIcon className="h-4 w-4" />
              <span>Billing Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log Out"
              className="gap-x-4 h-10 px-4"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                })
              }
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
export default AppSidebar;

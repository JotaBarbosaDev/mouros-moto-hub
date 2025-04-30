
import { SidebarNav } from "@/components/members/SidebarNav";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { PageContent } from "./PageContent";

interface MembersLayoutProps {
  children: React.ReactNode;
}

export function MembersLayout({ children }: MembersLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <PageContent>{children}</PageContent>
      </div>
    </SidebarProvider>
  );
}

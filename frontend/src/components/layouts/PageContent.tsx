
interface PageContentProps {
  children: React.ReactNode;
}

export function PageContent({ children }: PageContentProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  );
}

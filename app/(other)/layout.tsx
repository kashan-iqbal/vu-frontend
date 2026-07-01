// The sticky <Header /> (in the root layout) already reserves its own height in
// normal flow, so feature pages don't need extra top padding here.
export default function GenericLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import Header from "@/components/Header";
import CartSheet from "@/components/CartSheet";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <CartSheet />
    </>
  );
}

interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Transactions", href: "/transactions" },
  { label: "Settings", href: "/settings" },
];

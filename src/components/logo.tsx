import React from "react";
import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image src="/icon.png" alt="Logo" width={75} height={75} />
      <p className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent">
        BudgetBuddy
      </p>
    </Link>
  );
}

export default Logo;

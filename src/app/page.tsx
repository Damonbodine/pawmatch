"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-2xl font-bold text-orange-600">PawMatch</span>
          </div>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-orange-500 hover:bg-orange-600">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Find Your Perfect <span className="text-orange-500">Furry Friend</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            PawMatch connects animal shelters with loving adopters. Browse available pets,
            submit adoption applications, and give an animal a forever home.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8">
              Start Adopting
            </Button>
          </Link>
        </section>

        <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl border bg-white shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Browse Animals</h3>
            <p className="text-muted-foreground">Search by species, breed, age, and size to find your perfect match.</p>
          </div>
          <div className="text-center p-6 rounded-xl border bg-white shadow-sm">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Apply to Adopt</h3>
            <p className="text-muted-foreground">Submit applications and track their status through the process.</p>
          </div>
          <div className="text-center p-6 rounded-xl border bg-white shadow-sm">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold mb-2">Welcome Home</h3>
            <p className="text-muted-foreground">Complete the adoption and give a shelter animal their forever home.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

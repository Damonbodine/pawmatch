import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-2 shadow-lg">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90",
              card: "shadow-none",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "border-border text-foreground hover:bg-accent",
              formFieldInput:
                "border-input bg-background text-foreground",
              footerActionLink: "text-primary hover:text-primary/90",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}

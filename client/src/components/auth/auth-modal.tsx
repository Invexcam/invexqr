import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, resetPassword } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    const { user, error } = await signInWithEmail(data.email, data.password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      onOpenChange(false);
      window.location.reload(); // Refresh to update auth state
    }
    setLoading(false);
  };

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    const { user, error } = await signUpWithEmail(data.email, data.password, data.name);
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully.",
      });
      onOpenChange(false);
      window.location.reload(); // Refresh to update auth state
    }
    setLoading(false);
  };

  const handlePasswordReset = async (data: ResetFormData) => {
    setLoading(true);
    const { error } = await resetPassword(data.email);
    
    if (error) {
      toast({
        title: "Reset Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setMode("login");
    }
    setLoading(false);
  };

  const handleReplitAuth = () => {
    window.location.href = "/api/login";
  };

  const resetForms = () => {
    loginForm.reset();
    signupForm.reset();
    resetForm.reset();
  };

  const handleModeChange = (newMode: "login" | "signup" | "reset") => {
    setMode(newMode);
    resetForms();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "reset" && "Reset Password"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Replit Auth Option */}
          <div className="space-y-4">
            <Button 
              onClick={handleReplitAuth}
              variant="outline" 
              className="w-full h-12 text-base"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 8.91 9.99L12 17h9V7l-9-5z"/>
              </svg>
              Continue with Replit
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...loginForm.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-primary"
                  onClick={() => handleModeChange("reset")}
                >
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-primary"
                  onClick={() => handleModeChange("signup")}
                >
                  Sign up
                </Button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    className="pl-10"
                    {...signupForm.register("name")}
                  />
                </div>
                {signupForm.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...signupForm.register("email")}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    {...signupForm.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10"
                    {...signupForm.register("confirmPassword")}
                  />
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="text-center">
                <span className="text-muted-foreground">Already have an account? </span>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-primary"
                  onClick={() => handleModeChange("login")}
                >
                  Sign in
                </Button>
              </div>
            </form>
          )}

          {/* Password Reset Form */}
          {mode === "reset" && (
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <div>
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...resetForm.register("email")}
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {resetForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-primary"
                  onClick={() => handleModeChange("login")}
                >
                  Back to login
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
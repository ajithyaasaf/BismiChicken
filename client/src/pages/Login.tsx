import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmail, createAccount } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, UserPlus } from "lucide-react";

const userSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function Login() {
  const { setError } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: UserFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmail(values.email, values.password);
      // No need to navigate - Auth context will handle it
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to login";
      
      // Handle common Firebase errors
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Try again later.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      }
      
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: UserFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await createAccount(values.email, values.password);
      toast({
        title: "Success",
        description: "Account created! You can now log in.",
      });
      setActiveTab("login");
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to create account";
      
      // Handle common Firebase errors
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-gray-900 text-center">
            Chicken Business Management
          </CardTitle>
          <CardDescription className="text-center">
            Manage your chicken business efficiently
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isLoading ? "Registering..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Firebase authentication enabled
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

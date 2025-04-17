import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TestFirebase() {
  const { toast } = useToast();
  const [firebaseConfigValid, setFirebaseConfigValid] = React.useState(false);
  const [testUser, setTestUser] = React.useState<any>(null);

  React.useEffect(() => {
    // Check if Firebase environment variables are available
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;

    console.log("Firebase config check:");
    console.log("API Key available:", !!apiKey);
    console.log("Project ID available:", !!projectId);
    console.log("App ID available:", !!appId);

    setFirebaseConfigValid(!!apiKey && !!projectId && !!appId);
  }, []);

  // Mutation to register a test user
  const registerMutation = useMutation({
    mutationFn: (userData: any) => 
      apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: {
          "Content-Type": "application/json"
        }
      }),
    onSuccess: (data) => {
      toast({
        title: "User registered successfully",
        description: `User ${data.username} created with ID: ${data.id}`,
      });
      setTestUser(data);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not register user",
        variant: "destructive"
      });
    }
  });

  // Mutation to login with a test user
  const loginMutation = useMutation({
    mutationFn: (firebaseId: string) => 
      apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ firebaseId }),
        headers: {
          "Content-Type": "application/json"
        }
      }),
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: `Logged in as ${data.username}`,
      });
      setTestUser(data);
    },
    onError: (error: any) => {
      console.error("Backend login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Could not login",
        variant: "destructive"
      });
    }
  });

  // Register a test user for our Firestore tests
  const registerTestUser = () => {
    const testUser = {
      username: "TestUser" + Math.floor(Math.random() * 1000),
      email: `test${Math.floor(Math.random() * 1000)}@example.com`,
      password: "password123",
      firebaseId: "firebase-test-id-" + Math.floor(Math.random() * 1000)
    };
    
    registerMutation.mutate(testUser);
  };

  // Login with a test user
  const loginWithTestUser = () => {
    if (testUser) {
      loginMutation.mutate(testUser.firebaseId);
    } else {
      toast({
        title: "No test user",
        description: "Please register a test user first",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Firebase & Firestore Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firebase Config Check */}
        <Card>
          <CardHeader>
            <CardTitle>Firebase Configuration</CardTitle>
            <CardDescription>Checking environment variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-4 h-4 rounded-full ${firebaseConfigValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{firebaseConfigValid ? 'Firebase config is valid' : 'Firebase config is missing'}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This checks if VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID are set.
            </p>
          </CardContent>
        </Card>

        {/* Firestore User Test */}
        <Card>
          <CardHeader>
            <CardTitle>Firestore User Tests</CardTitle>
            <CardDescription>Test user registration and login with Firestore</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={registerTestUser}
                disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Registering...' : 'Register Test User'}
              </Button>

              <Button 
                onClick={loginWithTestUser}
                disabled={loginMutation.isPending || !testUser}
                className="ml-2">
                {loginMutation.isPending ? 'Logging in...' : 'Login with Test User'}
              </Button>

              {testUser && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="font-semibold">Test User Info:</h3>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(testUser, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { api } from "@/services/config";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Receipt, Eye, EyeOff, ArrowRight, ArrowLeft, Building2, Users, Check } from "lucide-react";
import { useToast } from "../hooks/use-toast";


const RoleCard = ({ role, title, description, features, icon, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`relative w-full p-6 rounded-xl text-left transition-all duration-300 border-2 ${selected
      ? "border-primary bg-primary/10 shadow-glow"
      : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
      }`}
  >
    {selected && (
      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <Check className="h-4 w-4 text-primary-foreground" />
      </div>
    )}
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${selected ? "bg-gradient-primary" : "bg-secondary"
      }`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-sm text-muted-foreground">
          <Check className={`h-4 w-4 mr-2 ${selected ? "text-primary" : "text-muted-foreground"}`} />
          {feature}
        </li>
      ))}
    </ul>
  </button>
);

const Signup = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleNextStep = () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose whether you're signing up as a Company or Client.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };



  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: selectedRole.toUpperCase(),
        company_name: formData.companyName,
        phone: formData.phone,
      };

      await api.post("/v1/auth/register", payload);

      toast({
        title: "Account created successfully!",
        description: `Welcome to BizVenue as a ${selectedRole}. Please sign in.`,
      });

      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-info/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <Card variant="bordered" className="w-full max-w-2xl relative z-10 animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Receipt className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {step === 1 ? "Create your account" : `Sign up as ${selectedRole === "company" ? "Company" : "Client"}`}
            </CardTitle>
            <CardDescription className="mt-2">
              {step === 1
                ? "Choose your account type to get started"
                : "Fill in your details to complete registration"}
            </CardDescription>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`w-8 h-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-8 h-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <RoleCard
                  role="company"
                  title="Company"
                  description="For businesses managing subscriptions and billing"
                  features={[
                    "Create and manage products",
                    "Set up subscription plans",
                    "Generate invoices",
                    "View revenue analytics",
                  ]}
                  icon={<Building2 className={`h-6 w-6 ${selectedRole === "company" ? "text-primary-foreground" : "text-muted-foreground"}`} />}
                  selected={selectedRole === "company"}
                  onSelect={() => handleRoleSelect("company")}
                />
                <RoleCard
                  role="client"
                  title="Client"
                  description="For customers subscribing to services"
                  features={[
                    "View your subscriptions",
                    "Manage billing info",
                    "Access invoices",
                    "Self-service portal",
                  ]}
                  icon={<Users className={`h-6 w-6 ${selectedRole === "client" ? "text-primary-foreground" : "text-muted-foreground"}`} />}
                  selected={selectedRole === "client"}
                  onSelect={() => handleRoleSelect("client")}
                />
              </div>

              <Button
                type="button"
                variant="gradient"
                className="w-full"
                onClick={handleNextStep}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {selectedRole === "company" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Acme Inc."
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {selectedRole === "client" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="My Business LLC"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;

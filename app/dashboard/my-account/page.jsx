"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/showToast";

export default function MyAccount() {
  // Router for navigation
  const router = useRouter();
  
  // State for user data
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    favoriteGame: "",
    city: "",
    state: "",
    country: ""
  });
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const responseData = await response.json();
          // The actual user data is in the data field
          const userData = responseData.data || responseData;
          setUser(userData);
          // Save email to localStorage for persistence
          if (userData.email) {
            localStorage.setItem("playerEmail", userData.email);
          }
        } else {
          // User not authenticated, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to localStorage if API fails
        const playerEmail = localStorage.getItem("playerEmail");
        if (!playerEmail) {
          router.push("/login");
        }
      } finally {
        setUserLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);
  
  // Fetch player profile on component mount
  useEffect(() => {
    // Skip if user data is still loading
    if (userLoading) return;
    
    // Get email from user data or fallback to localStorage
    const userEmail = user?.email || localStorage.getItem("playerEmail");
    
    // Pre-fill email if available
    if (userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }));
    }
    
    // Check if profile exists
    const checkProfile = async () => {
      setIsLoading(true);
      try {
        // Only fetch profile if email exists
        if (userEmail) {
          const response = await fetch(`/api/player?email=${encodeURIComponent(userEmail)}`);
          const data = await response.json();
          
          if (response.ok) {
            setFormData(data);
            setProfileExists(true);
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkProfile();
  }, [user, userLoading]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const method = profileExists ? "PUT" : "POST";
      const response = await fetch("/api/player", {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProfileExists(true);
        setIsEditMode(false);
        // Save email to localStorage for future visits
        localStorage.setItem("playerEmail", formData.email);
        showToast("success", profileExists ? "Profile updated successfully!" : "Profile created successfully!");
      } else {
        // Handle the case where the profile already exists but needs to be updated
        if (data.error && data.error.includes("already exists")) {
          // Update the existing profile instead of showing an error
          const updateResponse = await fetch("/api/player", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
          });
          
          const updateData = await updateResponse.json();
          
          if (updateResponse.ok) {
            setProfileExists(true);
            setIsEditMode(false);
            // Save email to localStorage for future visits
            localStorage.setItem("playerEmail", formData.email);
            showToast("success", "Profile updated successfully!");
          } else {
            showToast("error", updateData.error || "Failed to update profile");
          }
        } else {
          showToast("error", data.error || "Failed to save profile");
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("error", "An error occurred while saving your profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  // Render loading state
  if (isLoading && !profileExists) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-lg text-white">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // Render profile creation form or view/edit profile
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl text-white">
      <div className="relative mb-4 overflow-hidden">
        {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 h-1 w-full"></div> */}
        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{profileExists ? "My Profile" : "Create Your Profile"}</h1>
        <p className="text-gray-400">{profileExists ? "Manage your gaming profile" : "Join the gaming community"}</p>
        <div className="absolute -right-10 -top-10 h-32 w-32 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-xl"></div>
        <div className="absolute -left-10 -bottom-10 h-32 w-32 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-full blur-xl"></div>
      </div>

      <Card className="w-full bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-xl overflow-hidden relative text-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
        <CardHeader className="pb-4 bg-slate-800/50 border-b border-slate-700">
          <CardTitle className="text-xl text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{profileExists ? "My Profile" : "Create Your Profile"}</CardTitle>
        </CardHeader>
        <CardContent className="text-white bg-slate-800/30">
          {!profileExists || isEditMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    readOnly={!!user?.email || !!localStorage.getItem("playerEmail")}
                    className={`${user?.email || localStorage.getItem("playerEmail") ? "bg-slate-700/30" : "bg-slate-700/50"} border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-300">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favoriteGame" className="text-gray-300">Favorite Game</Label>
                  <Input
                    id="favoriteGame"
                    name="favoriteGame"
                    value={formData.favoriteGame}
                    onChange={handleInputChange}
                    placeholder="Your favorite game"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-300">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-300">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-300">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300"
                >
                  {isLoading ? "Saving..." : profileExists ? "Update Profile" : "Create Profile"}
                </Button>
                {profileExists && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditMode(false)}
                    className="border-slate-600 text-gray-300 hover:bg-slate-700 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-700">
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
                    <p className="text-sm text-gray-400">Full Name</p>
                  </div>
                  <p className="font-medium text-white text-lg">{formData.fullName}</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full"></div>
                    <p className="text-sm text-gray-400">Username</p>
                  </div>
                  <p className="font-medium text-white text-lg">{formData.username}</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gradient-to-br from-pink-600 to-red-600 rounded-full"></div>
                    <p className="text-sm text-gray-400">Email</p>
                  </div>
                  <p className="font-medium text-white text-lg">{formData.email}</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gradient-to-br from-red-600 to-orange-600 rounded-full"></div>
                    <p className="text-sm text-gray-400">Phone Number</p>
                  </div>
                  <p className="font-medium text-white text-lg">{formData.phoneNumber}</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-full"></div>
                    <p className="text-sm text-gray-400">Date of Birth</p>
                  </div>
                  <p className="font-medium text-white text-lg">{new Date(formData.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gradient-to-br from-yellow-600 to-green-600 rounded-full"></div>
                    <p className="text-sm text-gray-400">Favorite Game</p>
                  </div>
                  <p className="font-medium text-white text-lg">{formData.favoriteGame}</p>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-gradient-to-br from-green-600 to-blue-600 rounded-full"></div>
                    <p className="text-sm text-gray-400">Location</p>
                  </div>
                  <p className="font-medium text-white text-lg">{formData.city}, {formData.state}, {formData.country}</p>
                </div>
              </div>
              <Button 
                onClick={toggleEditMode} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-300"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

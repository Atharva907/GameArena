"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Users, Trophy, AlertCircle, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/utils";

const parseEntryFee = (entryFee) => {
  if (!entryFee || entryFee === "Free") return 0;
  const parsed = Number.parseFloat(String(entryFee).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function TournamentRegistration() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id;
  const registrationPath = tournamentId ? `/tournaments/${tournamentId}/register` : "/tournaments";
  const loginCallback = tournamentId
    ? `/auth/login?callback=${encodeURIComponent(registrationPath)}`
    : "/auth/login";

  // State for user data
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [sessionErrorMessage, setSessionErrorMessage] = useState("");
  const [profileRequiredMessage, setProfileRequiredMessage] = useState("");

  // State for tournament data
  const [tournament, setTournament] = useState(null);
  const [tournamentLoading, setTournamentLoading] = useState(true);

  // State for player details
  const [playerDetails, setPlayerDetails] = useState({
    fullName: "",
    dateOfBirth: "",
    city: "",
    state: "",
    email: ""
  });

  // State for tournament-specific details
  const [tournamentDetails, setTournamentDetails] = useState({
    teamName: "",
    contactNumber: ""
  });

  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletError, setWalletError] = useState("");

  const entryFeeAmount = parseEntryFee(tournament?.entryFee);
  const isWalletSufficient = walletBalance >= entryFeeAmount;

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiFetch("/user/me");
        if (response.ok) {
          const userData = await response.json();
          const normalizedUser = userData.data || userData;
          setUser(normalizedUser);
          setSessionErrorMessage("");

          if (normalizedUser.email) {
            setPlayerDetails(prev => ({ ...prev, email: normalizedUser.email }));

            const playerResponse = await apiFetch(
              `/player?email=${encodeURIComponent(normalizedUser.email)}`,
            );

            if (playerResponse.ok) {
              const playerProfile = await playerResponse.json();
              setProfileRequiredMessage("");
              setWalletError("");
              setPlayerDetails(prev => ({
                ...prev,
                fullName: playerProfile.fullName || prev.fullName,
                dateOfBirth: playerProfile.dateOfBirth
                  ? new Date(playerProfile.dateOfBirth).toISOString().slice(0, 10)
                  : prev.dateOfBirth,
                city: playerProfile.city || prev.city,
                state: playerProfile.state || prev.state,
                email: playerProfile.email || normalizedUser.email,
              }));
              setWalletBalance(Number(playerProfile.walletBalance ?? 0));
            } else {
              setProfileRequiredMessage(
                "Complete your profile before registering. Tournament fees are deducted from your wallet profile.",
              );
              setWalletBalance(0);
            }
          }
        } else if (response.status === 401 || response.status === 403) {
          // User not authenticated, redirect to login
          router.replace(loginCallback);
          return;
        } else {
          setSessionErrorMessage(
            "Unable to verify your session right now. Please try again later.",
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSessionErrorMessage("Unable to verify your session right now. Please try again later.");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch tournament data on component mount
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await apiFetch(`/tournaments/${tournamentId}`);
        if (response.ok) {
          const data = await response.json();
          setTournament(data.data || data);
        } else {
          alert("Failed to load tournament details");
          router.push("/tournaments");
        }
      } catch (error) {
        console.error("Error fetching tournament:", error);
        alert("Failed to load tournament details");
        router.push("/tournaments");
      } finally {
        setTournamentLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId, router]);

  // Check if user is already registered
  useEffect(() => {
    if (!user || !tournament) return;

    const checkRegistration = async () => {
      try {
        const response = await apiFetch(
          `/registration/check?tournamentId=${tournamentId}&email=${encodeURIComponent(user.email)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setIsAlreadyRegistered(data.isRegistered);
        }
      } catch (error) {
        console.error("Error checking registration:", error);
      }
    };

    checkRegistration();
  }, [user, tournament, tournamentId]);

  // Handle player details input change
  const handlePlayerDetailsChange = (e) => {
    const { name, value } = e.target;
    setPlayerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tournament details input change
  const handleTournamentDetailsChange = (e) => {
    const { name, value } = e.target;
    setTournamentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle player details form submission
  const handlePlayerDetailsSubmit = (e) => {
    e.preventDefault();
    // Move to next step
    setCurrentStep(2);
  };

  // Handle wallet review
  const handleWalletReview = () => {
    if (entryFeeAmount > 0 && !isWalletSufficient) {
      setWalletError(
        `Your wallet balance is ${formatCurrency(walletBalance)}. Add ${formatCurrency(
          entryFeeAmount - walletBalance,
        )} or more to continue.`,
      );
      return;
    }

    setWalletError("");
    setCurrentStep(3);
  };

  // Handle tournament registration
  const handleRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setWalletError("");

    if (entryFeeAmount > 0 && !isWalletSufficient) {
      setIsLoading(false);
      setCurrentStep(2);
      setWalletError(
        `Your wallet balance is ${formatCurrency(walletBalance)}. Add ${formatCurrency(
          entryFeeAmount - walletBalance,
        )} or more to continue.`,
      );
      return;
    }

    const registrationData = {
      tournamentId,
      playerEmail: playerDetails.email,
      playerName: playerDetails.fullName,
      dateOfBirth: playerDetails.dateOfBirth,
      city: playerDetails.city,
      state: playerDetails.state,
      teamName: tournamentDetails.teamName,
      contactNumber: tournamentDetails.contactNumber
    };

    try {
      const response = await apiFetch("/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`You've been successfully registered for ${tournament.name}!`);
        setTimeout(() => {
          router.push("/dashboard/my-tournaments");
        }, 2000);
      } else {
        console.error("Registration failed:", data.error);
        if (data.error?.toLowerCase().includes("insufficient")) {
          setCurrentStep(2);
          setWalletError(
            `Your wallet could not cover the ${tournament?.entryFee || "entry fee"}. Add funds and try again.`,
          );
        }
        alert(data.error || "Failed to register for tournament");
      }
    } catch (error) {
      console.error("Error registering for tournament:", error);
      alert("An error occurred while registering");
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (userLoading || tournamentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (sessionErrorMessage && !user) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-yellow-500" />
            <h2 className="text-2xl font-bold">Registration Unavailable</h2>
            <p className="text-gray-400">{sessionErrorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.replace(loginCallback)}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => router.push("/tournaments")}>
                Back to Tournaments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If already registered
  if (isAlreadyRegistered) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Already Registered</h2>
            <p className="text-gray-400 mb-6">You're already registered for this tournament.</p>
            <Button onClick={() => router.push("/dashboard/my-tournaments")}>
              View My Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Tournament Registration</h1>
        <p className="text-gray-400">Complete the steps below to register for the tournament</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 1 ? "bg-purple-600 text-white" : "bg-slate-700 text-gray-400"
            }`}>
              1
            </div>
            <span className={`text-sm ${currentStep >= 1 ? "text-white" : "text-gray-400"}`}>Player Details</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 2 ? "bg-purple-600 text-white" : "bg-slate-700 text-gray-400"
            }`}>
              2
            </div>
            <span className={`text-sm ${currentStep >= 2 ? "text-white" : "text-gray-400"}`}>Wallet Review</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              currentStep >= 3 ? "bg-purple-600 text-white" : "bg-slate-700 text-gray-400"
            }`}>
              3
            </div>
            <span className={`text-sm ${currentStep >= 3 ? "text-white" : "text-gray-400"}`}>Tournament Details</span>
          </div>
        </div>

        <Progress value={(currentStep / 3) * 100} className="h-2 bg-slate-700" />
      </div>

      {/* Tournament Details Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {tournament?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>{tournament?.date}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin className="h-4 w-4" />
            <span>{tournament?.region}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="h-4 w-4" />
            <span>{tournament?.format}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Badge variant="outline" className="bg-slate-700/50 text-gray-200 border-slate-600">
              {tournament?.game}
            </Badge>
            <Badge className="bg-green-600/20 text-green-400 border-green-500/50">
              {tournament?.status}
            </Badge>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="text-sm text-gray-400">Entry Fee</p>
              <p className="text-xl font-bold text-green-400">{tournament?.entryFee}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Prize Pool</p>
              <p className="text-xl font-bold text-yellow-400">{tournament?.prize}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Details Form */}
      {currentStep === 1 && (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Player Details</CardTitle>
          </CardHeader>
          <CardContent>
            {profileRequiredMessage && (
              <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                <div className="mb-3 flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{profileRequiredMessage}</p>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/my-account?callback=${encodeURIComponent(registrationPath)}`,
                    )
                  }
                  className="bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Create Profile
                </Button>
              </div>
            )}
            <form onSubmit={handlePlayerDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={playerDetails.fullName}
                    onChange={handlePlayerDetailsChange}
                    placeholder="Enter your full name"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={playerDetails.dateOfBirth}
                    onChange={handlePlayerDetailsChange}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={playerDetails.city}
                    onChange={handlePlayerDetailsChange}
                    placeholder="Enter your city"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={playerDetails.state}
                    onChange={handlePlayerDetailsChange}
                    placeholder="Enter your state"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={playerDetails.email}
                  onChange={handlePlayerDetailsChange}
                  placeholder="Enter your email"
                  required
                  readOnly={Boolean(user?.email)}

                  className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <Button
                type="submit"
                disabled={Boolean(profileRequiredMessage)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Wallet Review Step */}
      {currentStep === 2 && (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Wallet Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Entry Fee</span>
                <span className="text-xl font-bold text-green-400">{tournament?.entryFee || "Free"}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Wallet Balance</span>
                <span className={`text-xl font-bold ${isWalletSufficient ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(walletBalance)}
                </span>
              </div>
              {entryFeeAmount > 0 && (
                <div className="border-t border-slate-600 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Remaining After Registration</span>
                    <span className={`text-xl font-bold ${isWalletSufficient ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(walletBalance - entryFeeAmount)}
                    </span>
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-slate-600/50 bg-slate-900/40 p-3 text-sm text-gray-300">
                {entryFeeAmount === 0
                  ? "This tournament is free. No wallet deduction will be applied."
                  : isWalletSufficient
                    ? "Your wallet can cover the entry fee. Continue to complete the registration."
                    : "Your wallet balance is not enough for this tournament. Add funds before continuing."}
              </div>
            </div>

            {walletError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {walletError}
              </div>
            )}

            <div className="flex gap-3">
              {entryFeeAmount > 0 && !isWalletSufficient ? (
                  <Button
                  type="button"
                  onClick={() => router.push(`/dashboard/wallet?callback=${encodeURIComponent(registrationPath)}`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleWalletReview}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Continue to Tournament Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tournament Details Form */}
      {currentStep === 3 && (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistration} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  name="teamName"
                  value={tournamentDetails.teamName}
                  onChange={handleTournamentDetailsChange}
                  placeholder="Enter your team name (if applicable)"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={tournamentDetails.contactNumber}
                  onChange={handleTournamentDetailsChange}
                  placeholder="Enter your contact number"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Registering...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

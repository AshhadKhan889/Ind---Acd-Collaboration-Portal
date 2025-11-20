import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./components/Login";
import RegisterStep1 from "./components/RegisterStep1";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ProfileCompletion from "./components/ProfileCompletion";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import IndustryDashboard from "./components/IndustryDashboard";
import AcademiaDashboard from "./components/AcademiaDashboard";
import HomePage from "./components/HomePage";
import PostOpportunity from "./components/PostOpportunity";
import JobPosting from "./components/JobPosting";
import ProjectPosting from "./components/ProjectPosting";
import InternshipPosting from "./components/InternshipsPosting";
import JobDetails from "./components/JobDetails";
import ProfessionalHistory from "./components/ProfessionalHistory";
import PublicLayout from "./components/PublicLayout";
import Applications from "./components/Applications";
import ApplicationForm from "./components/ApplicationForm";
import InternshipDetails from "./components/InternshipDetails";
import ProjectDetails from "./components/ProjectDetails";
import ViewOpportunities from "./components/ViewOpportunities";
import ProtectedRoute from "./components/ProtectedRoute";
import MyJobsPage from "./components/MyJobsPage";
import JobUpdatePage from "./components/JobUpdatePage";
import Unauthorized from "./components/Unauthorized";
import ProjectUpdatePage from "./components/ProjectUpdatePage";
import InternshipUpdate from "./components/InternshipUpdate";
import ApplicantsPage from "./components/ApplicantsPage";
import ResetPasswordPage from "./components/ResetPassword";
import Forum from "./components/Forum";
import ForumPost from "./components/ForumPost";
import CreateForumPost from "./components/CreateForumPost";
import UserProfile from "./components/UserProfile";
import BlockUser from "./components/BlockUsers";
import ActivateAccount from "./components/ActivateAccount";
import ResendActivation from "./components/ResendActivation";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterStep1 />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/activate/:token" element={<ActivateAccount />} />
          <Route path="/resend-activation" element={<ResendActivation />} />
        </Route>

        {/* Complete Profile route */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <ProfileCompletion />
            </ProtectedRoute>
          }
        />

        {/* Protected routes (requires login) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home-page" replace />} />
          <Route path="home-page" element={<HomePage />} />
          <Route path="job-details/:id" element={<JobDetails />} />

          {/* Student-only routes */}
          <Route
            path="history"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <ProfessionalHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="applications"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Applications />
              </ProtectedRoute>
            }
          />

          {/* Apply Form (any logged-in user can apply) */}
          <Route path="apply/:type/:id" element={<ApplicationForm />} />

          {/* Common routes */}
          <Route
            path="internship-details/:id"
            element={<InternshipDetails />}
          />
          <Route path="project-details/:id" element={<ProjectDetails />} />
          <Route path="view" element={<ViewOpportunities />} />
          <Route path="/jobs/update/:id" element={<JobUpdatePage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/projects/update/:id" element={<ProjectUpdatePage />} />
          <Route
            path="/internships/update/:id"
            element={<InternshipUpdate />}
          />
          <Route path="/:type/:id/applicants" element={<ApplicantsPage />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:id" element={<ForumPost />} />
          <Route path="/forum/create" element={<CreateForumPost />} />
          <Route path="/profile/:id" element={<UserProfile />} />

          {/* Role-based: My Jobs */}
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Academia", "Industry Official"]}
              >
                <MyJobsPage />
              </ProtectedRoute>
            }
          />

          {/* Post routes restricted to Admin, Academia, Industry */}
          {["post", "post-job", "post-project", "post-internship"].map(
            (path) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute
                    allowedRoles={["Admin", "Academia", "Industry Official"]}
                  >
                    {
                      {
                        post: <PostOpportunity />,
                        "post-job": <JobPosting />,
                        "post-project": <ProjectPosting />,
                        "post-internship": <InternshipPosting />,
                      }[path]
                    }
                  </ProtectedRoute>
                }
              />
            )
          )}

          {/* Dashboards */}
          <Route
            path="dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/industry-official"
            element={
              <ProtectedRoute allowedRoles={["Industry Official"]}>
                <IndustryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/academia"
            element={
              <ProtectedRoute allowedRoles={["Academia"]}>
                <AcademiaDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin-only tools */}
          <Route
            path="/admin/block-user"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <BlockUser />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

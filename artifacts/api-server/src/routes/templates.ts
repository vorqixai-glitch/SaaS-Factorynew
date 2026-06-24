import { Router } from "express";

const router = Router();

const TEMPLATES = [
  { id: "blank", name: "Blank SaaS", description: "Start from scratch with full control", category: "General", icon: "FileCode", popular: false },
  { id: "crm", name: "CRM Platform", description: "Customer relationship management with pipeline tracking", category: "Business", icon: "Users", popular: true },
  { id: "lms", name: "Learning Platform", description: "Course creation and student management system", category: "Education", icon: "GraduationCap", popular: true },
  { id: "ecommerce", name: "E-commerce Store", description: "Full online store with cart and checkout", category: "Commerce", icon: "ShoppingCart", popular: true },
  { id: "analytics", name: "Analytics Dashboard", description: "Real-time metrics and business intelligence", category: "Analytics", icon: "BarChart3", popular: false },
  { id: "saas-starter", name: "SaaS Starter", description: "Auth, billing, and team management pre-built", category: "General", icon: "Rocket", popular: true },
  { id: "marketplace", name: "Marketplace", description: "Two-sided marketplace with listings and payments", category: "Commerce", icon: "Store", popular: false },
  { id: "api-platform", name: "API Platform", description: "Developer-focused API product with docs portal", category: "Developer", icon: "Code2", popular: false },
  { id: "booking", name: "Booking System", description: "Scheduling and appointment management", category: "Business", icon: "Calendar", popular: false },
  { id: "social", name: "Social Network", description: "Community platform with feeds and messaging", category: "Social", icon: "MessageSquare", popular: false },
  { id: "ai-tool", name: "AI Tool", description: "AI-powered SaaS with prompt interface and results", category: "AI", icon: "Sparkles", popular: true },
  { id: "blog-platform", name: "Blog Platform", description: "Multi-author publishing with CMS", category: "Content", icon: "FileText", popular: false },
];

router.get("/templates", (req, res) => {
  res.json(TEMPLATES);
});

export default router;

import browserClient from "./browser-client";
import { ENDPOINTS } from "./endpoint";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export type ListParams = Record<string, string | number | undefined>;

// ── Overview ──
export interface DailyCount {
  _id: string;
  count: number;
}

export interface OverviewStats {
  totals: {
    users: number;
    contributions: number;
    handouts: number;
    pastMcqs: number;
    aiMcqs: number;
    feedback: number;
    newsletter: number;
  };
  trends: {
    signupsPerDay: DailyCount[];
    uploadsPerDay: DailyCount[];
    feedbackPerDay: DailyCount[];
  };
  topMissedTopics: { _id: string; missedCount: number }[];
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const { data } = await browserClient.get(ENDPOINTS.admin.overview);
  return data;
}

// ── Users ──
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  provider: string;
  phoneNo?: number;
  createdAt: string;
}

export async function getUsers(params: ListParams): Promise<PaginatedResult<AdminUser>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.users, { params });
  return data;
}

export async function setUserActiveStatus(
  id: string,
  isActive: boolean,
): Promise<{ user: AdminUser }> {
  const { data } = await browserClient.patch(ENDPOINTS.admin.userStatus(id), { isActive });
  return data;
}

// ── Contributions ──
export type ContributionStatus = "pending" | "approved" | "rejected";

export interface AdminContribution {
  _id: string;
  code: string;
  status: ContributionStatus;
  uploaderName: string;
  uploaderPhone: string;
  originalName: string;
  size: number;
  note?: string;
  pdfUrl: string | null;
  createdAt: string;
}

export async function getContributions(
  params: ListParams,
): Promise<PaginatedResult<AdminContribution>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.contributions, { params });
  return data;
}

export async function approveContribution(
  id: string,
): Promise<{ contribution: AdminContribution }> {
  const { data } = await browserClient.patch(ENDPOINTS.admin.contributionApprove(id));
  return data;
}

export async function rejectContribution(
  id: string,
): Promise<{ contribution: AdminContribution }> {
  const { data } = await browserClient.patch(ENDPOINTS.admin.contributionReject(id));
  return data;
}

// ── Contributors ──
export interface AdminContributor {
  phone: string;
  name: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export async function getContributors(
  params: ListParams,
): Promise<PaginatedResult<AdminContributor>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.contributors, { params });
  return data;
}

export interface AdminContributorDetail {
  phone: string;
  name: string | null;
  summary: { total: number; pending: number; approved: number; rejected: number };
  uploads: AdminContribution[];
}

export async function getContributorDetail(phone: string): Promise<AdminContributorDetail> {
  const { data } = await browserClient.get(ENDPOINTS.admin.contributorDetail(phone));
  return data;
}

// ── Handouts ──
export interface AdminHandout {
  _id: string;
  code: string;
  examType: string;
  contentLength: number;
  createdAt: string;
  updatedAt: string;
}

export async function getHandouts(params: ListParams): Promise<PaginatedResult<AdminHandout>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.handouts, { params });
  return data;
}

// ── Past-quiz MCQs ──
export interface AdminPastMcq {
  _id: string;
  id: number;
  question: string;
  type: string;
  code: string;
  options: string[];
  correctAnswer: number;
  generated: boolean;
}

export async function getPastMcqs(params: ListParams): Promise<PaginatedResult<AdminPastMcq>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.mcqsPast, { params });
  return data;
}

// ── AI-generated MCQs ──
export interface AdminAiMcq {
  _id: string;
  id: number;
  question: string;
  type: string;
  code: string;
  topic_name: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function getAiMcqs(params: ListParams): Promise<PaginatedResult<AdminAiMcq>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.mcqsAi, { params });
  return data;
}

// ── Wrong answers ──
export interface AdminWrongAnswer {
  _id: string;
  userId: string;
  quizId: number;
  code: string;
  type: string;
  topic_name: string;
  createdAt: string;
}

export async function getWrongAnswers(
  params: ListParams,
): Promise<PaginatedResult<AdminWrongAnswer>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.wrongAnswers, { params });
  return data;
}

// ── Feedback ──
export interface AdminFeedback {
  _id: string;
  rating: number;
  comment?: string;
  context?: string;
  reference?: string;
  user?: { _id: string; name: string; email: string };
  createdAt: string;
}

export async function getFeedback(params: ListParams): Promise<PaginatedResult<AdminFeedback>> {
  const { data } = await browserClient.get(ENDPOINTS.admin.feedback, { params });
  return data;
}

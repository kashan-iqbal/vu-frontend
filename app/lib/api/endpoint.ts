export const ENDPOINTS = {
  quiz: {
    getByCode: (code: string) => `/quiz/${code}`,
    submitQuiz: "/quiz/submitQuiz",
  },
  topicReview: {
    get: (quizCode: string) => `/topic-review/${quizCode}`,
  },
  pastQuiz: {
    getByCode: (code: string, examType: string) =>
      `/pastquiz/${code}/${examType}`,
  },
  contribution: {
    codes: "/contributions/codes",
    upload: (code: string) => `/contributions/${code}`,
  },
  feedback: {
    submit: "/feedback",
  },
  readiness: {
    get: (code: string, examType: string) => `/readiness/${code}/${examType}`,
  },
  crashPlan: {
    get: (code: string, examType: string) => `/crash-plan/${code}/${examType}`,
    generate: (code: string, examType: string) =>
      `/crash-plan/${code}/${examType}`,
  },
  gdb: {
    help: "/gdb/help",
    status: "/gdb/status",
  },
  handout: {
    get: (code: string, examType: string) => `/handout/${code}/${examType}`,
  },
  auth: {
    login: "/auth/login",
    sendOtp: "/auth/send-otp",
    verifyOtp: "/auth/verify-otp",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    verifyResetOtp: "/auth/verify-reset-otp",
    resetPassword: "/auth/reset-password",
    logout: "/auth/logout",
    google: "/auth/google",
  },
  user: {
    me: "/user/me",
  },
  admin: {
    overview: "/admin/stats/overview",
    users: "/admin/users",
    userStatus: (id: string) => `/admin/users/${id}/status`,
    contributions: "/admin/contributions",
    contributionApprove: (id: string) => `/admin/contributions/${id}/approve`,
    contributionReject: (id: string) => `/admin/contributions/${id}/reject`,
    contributors: "/admin/contributors",
    contributorDetail: (phone: string) => `/admin/contributors/${phone}`,
    handouts: "/admin/handouts",
    mcqsPast: "/admin/mcqs/past",
    mcqsAi: "/admin/mcqs/ai",
    wrongAnswers: "/admin/mcqs/wrong-answers",
    feedback: "/admin/feedback",
  },
  // add more as your app grows
};

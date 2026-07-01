export const ENDPOINTS = {
  quiz: {
    getByCode: (code: string) => `/quiz/${code}`,
    submitQuiz: "/quiz/submitQuiz",
    uploadPdf: "/quiz/upload-pdf",
  },
  topicReview: {
    get: (quizCode: string) => `/topic-review/${quizCode}`,
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
  // add more as your app grows
};

"use client";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  BookOpen,
  Send,
  MessageCircle,
  Lightbulb,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Logo } from "@/components/Logo";

/**
 * AI Chat Page - Modern Academic Minimalism Design
 * Interactive chat interface for exam preparation assistance with mobile sidebar
 */
export default function Chat() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string }>
  >([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI exam preparation assistant. Ask me anything about Data Structures, Algorithms, or any Computer Science topic. How can I help you prepare today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That's a great question! In data structures, a hash table uses a hash function to map keys to values. This allows for O(1) average-case lookup time. The key is choosing a good hash function to minimize collisions.",
        "Binary search trees are a fundamental data structure. They maintain sorted data and allow for efficient searching, insertion, and deletion operations. The time complexity is O(log n) for balanced trees.",
        "Dynamic programming is a technique where you break down a problem into overlapping subproblems and store their solutions to avoid redundant calculations. It's useful for optimization problems like the knapsack problem.",
        "When dealing with graphs, you can use BFS (Breadth-First Search) for level-by-level traversal or DFS (Depth-First Search) for exploring as far as possible along each branch. Choose based on your specific use case.",
        "Sorting algorithms have different time complexities. Quick Sort is O(n log n) on average, Merge Sort is O(n log n) guaranteed, and Bubble Sort is O(n²). Choose based on your data characteristics.",
      ];

      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)];

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: randomResponse,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 800);
  };

  const suggestedQuestions = [
    "Explain Binary Search Trees",
    "What is Dynamic Programming?",
    "How do hash tables work?",
    "Difference between BFS and DFS",
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => setLocation("/courses")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold text-blue-900">ExamPrep AI</span>
          </button>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">
              Data Structures & Algorithms
            </span>
            <button
              onClick={() => setLocation("/login")}
              className="text-slate-700 hover:text-blue-900 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-white">
            {messages.length === 1 ? (
              <div className="h-full flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  Start Your Preparation
                </h2>
                <p className="text-slate-600 text-center mb-8 max-w-md">
                  Ask me anything about your course. I'll provide detailed
                  explanations, examples, and help you understand complex
                  concepts.
                </p>

                {/* Suggested Questions */}
                <div className="w-full max-w-2xl">
                  <p className="text-sm font-semibold text-slate-700 mb-4">
                    Try asking:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputValue(question);
                        }}
                        className="p-4 border border-slate-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">
                            {question}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl px-6 py-4 rounded-xl ${
                        message.role === "user"
                          ? "bg-blue-900 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200"
                      }`}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-900 px-6 py-4 rounded-xl rounded-bl-none border border-slate-200">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="container max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question about your course..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 disabled:bg-slate-50"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 border-l border-slate-200 bg-slate-50 flex-col">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-blue-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setLocation("/quiz")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group"
              >
                <Zap className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">
                  Take MCQ Test
                </span>
              </button>
              <button
                onClick={() => setLocation("/courses")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group"
              >
                <BookOpen className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">
                  Change Course
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-bold text-blue-900 mb-4">Learning Tips</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-700 mb-1">
                  Ask Specific Questions
                </p>
                <p>The more specific your question, the better the answer.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">
                  Request Examples
                </p>
                <p>Ask for code examples or real-world applications.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-1">
                  Test Your Knowledge
                </p>
                <p>Take MCQ tests to assess your understanding.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="absolute right-0 top-16 bottom-0 w-64 bg-slate-50 border-l border-slate-200 z-40 flex flex-col lg:hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-bold text-blue-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setLocation("/quiz");
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group"
                >
                  <Zap className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">
                    Take MCQ Test
                  </span>
                </button>
                <button
                  onClick={() => {
                    setLocation("/courses");
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group"
                >
                  <BookOpen className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">
                    Change Course
                  </span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-blue-900 mb-4">Learning Tips</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-700 mb-1">
                    Ask Specific Questions
                  </p>
                  <p>The more specific your question, the better the answer.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">
                    Request Examples
                  </p>
                  <p>Ask for code examples or real-world applications.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">
                    Test Your Knowledge
                  </p>
                  <p>Take MCQ tests to assess your understanding.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

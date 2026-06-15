"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface BlogPostContentProps {
  markdown: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-brand-navy mt-6 mb-3 leading-snug">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-brand-navy mt-5 mb-2 leading-snug">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold text-brand-navy mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-gray-700 leading-relaxed mb-3">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-navy underline hover:text-brand-red transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-brand-navy">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-sm text-gray-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-sm text-gray-700">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-navy pl-4 italic text-gray-500 my-4">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    return isBlock ? (
      <code className="block bg-gray-100 rounded-xl p-4 text-sm text-gray-800 overflow-x-auto whitespace-pre my-3">
        {children}
      </code>
    ) : (
      <code className="bg-gray-100 rounded px-1 text-sm text-[#c7254e]">{children}</code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => <hr className="border-gray-200 my-6" />,
};

export function BlogPostContent({ markdown }: BlogPostContentProps) {
  return (
    <div className="max-w-none">
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </div>
  );
}

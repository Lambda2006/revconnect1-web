import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BlogPostContent } from "./BlogPostContent";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, content_md, excerpt, post_type, boat_make, boat_model, published_at, source_urls")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

  const sourceUrls: string[] = Array.isArray(post.source_urls) ? post.source_urls : [];

  return (
    <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand-navy transition-colors mb-5"
      >
        ← Back to Blog
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
              post.post_type === "model_specific"
                ? "bg-brand-navy/10 text-brand-navy"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {post.post_type === "model_specific" ? "Model-Specific" : "General"}
          </span>

          {post.post_type === "model_specific" && post.boat_make && (
            <span className="text-xs text-brand-red font-semibold">
              {post.boat_make}{post.boat_model ? ` · ${post.boat_model}` : ""}
            </span>
          )}

          {post.published_at && (
            <span className="text-xs text-gray-400">
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-brand-navy leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">{post.excerpt}</p>
        )}
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Markdown body */}
      <BlogPostContent markdown={post.content_md} />

      {/* Source citations */}
      {sourceUrls.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Sources</p>
          <div className="flex flex-wrap gap-2">
            {sourceUrls.map((url, i) => {
              let hostname = url;
              try { hostname = new URL(url).hostname.replace(/^www\./, ""); } catch {}
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  {hostname}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

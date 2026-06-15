import { createClient } from "@/lib/supabase/server";
import { BlogList } from "./BlogList";
import type { BlogPost } from "./BlogList";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, post_type, boat_make, boat_model, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const posts: BlogPost[] = (error || !data) ? [] : data;

  return (
    <div className="px-4 pt-4 pb-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Boater&apos;s Blog</h1>
        <p className="text-sm text-gray-500 mt-1">
          Model-specific guides, maintenance tips, and boating knowledge — updated weekly.
        </p>
      </div>

      <BlogList posts={posts} />
    </div>
  );
}

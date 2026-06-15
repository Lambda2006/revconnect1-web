import { supabaseAdmin } from "@/lib/supabase/server";

export type ApprovedSource = {
  id: string;
  source_name: string;
  base_url: string;
  source_type: "support_site" | "parts_catalog" | "recall_db" | "blog_post";
  boat_make: string | null;
  boat_model: string | null;
  is_active: boolean;
  source_blog_post_id: string | null;
};

export type BlogPostContext = {
  title: string;
  slug: string;
  content_md: string;
  boat_make: string | null;
  boat_model: string | null;
};

/**
 * Returns approved external sources for the given boat (excludes blog_post entries —
 * those are injected as inline context via getRelevantBlogPosts instead).
 * Priority: model-specific > brand-level > universal.
 */
export async function getApprovedSources(
  boatMake: string,
  boatModel: string
): Promise<ApprovedSource[]> {
  const { data } = await supabaseAdmin
    .from("approved_sources")
    .select("*")
    .eq("is_active", true)
    .neq("source_type", "blog_post")
    .or(
      `and(boat_make.eq.${boatMake},boat_model.eq.${boatModel}),` +
      `and(boat_make.eq.${boatMake},boat_model.is.null),` +
      `and(boat_make.is.null,boat_model.is.null)`
    );

  if (!data) return [];

  return (data as ApprovedSource[]).sort((a, b) => {
    const scoreA = a.boat_model ? 2 : a.boat_make ? 1 : 0;
    const scoreB = b.boat_model ? 2 : b.boat_make ? 1 : 0;
    return scoreB - scoreA;
  });
}

/**
 * Returns published blog posts relevant to the given boat, ordered newest-first.
 * Includes model-specific, brand-level, and general posts (up to 5 total).
 * Content is injected directly into the agent system prompt — no URL fetching needed.
 */
export async function getRelevantBlogPosts(
  boatMake: string,
  boatModel: string
): Promise<BlogPostContext[]> {
  const { data } = await supabaseAdmin
    .from("blog_posts")
    .select("title, slug, content_md, boat_make, boat_model")
    .eq("status", "published")
    .or(
      `and(boat_make.eq.${boatMake},boat_model.eq.${boatModel}),` +
      `and(boat_make.eq.${boatMake},boat_model.is.null),` +
      `and(boat_make.is.null,boat_model.is.null)`
    )
    .order("published_at", { ascending: false })
    .limit(5);

  return (data ?? []) as BlogPostContext[];
}

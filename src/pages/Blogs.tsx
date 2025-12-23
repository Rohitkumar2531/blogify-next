import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, User, Heart, MessageCircle, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Web Development: Trends to Watch in 2024",
    excerpt: "Explore the cutting-edge technologies and frameworks that are shaping the future of web development...",
    author: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "Dec 20, 2024",
    readTime: "5 min read",
    likes: 234,
    comments: 45,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    tags: ["Technology", "Web Dev"],
    featured: true,
  },
  {
    id: 2,
    title: "Building Scalable Applications with Modern Architecture",
    excerpt: "Learn the best practices for building applications that can handle millions of users...",
    author: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "Dec 18, 2024",
    readTime: "8 min read",
    likes: 189,
    comments: 32,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    tags: ["Architecture", "Backend"],
    featured: false,
  },
  {
    id: 3,
    title: "The Art of Writing Clean Code",
    excerpt: "Discover principles and patterns that will help you write maintainable and readable code...",
    author: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    date: "Dec 15, 2024",
    readTime: "6 min read",
    likes: 312,
    comments: 67,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&h=400&fit=crop",
    tags: ["Best Practices", "Coding"],
    featured: false,
  },
  {
    id: 4,
    title: "Understanding TypeScript: A Complete Guide",
    excerpt: "Master TypeScript from basics to advanced concepts with practical examples...",
    author: "James Park",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    date: "Dec 12, 2024",
    readTime: "12 min read",
    likes: 156,
    comments: 28,
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop",
    tags: ["TypeScript", "Tutorial"],
    featured: false,
  },
  {
    id: 5,
    title: "Designing for Accessibility: A Practical Guide",
    excerpt: "Learn how to create inclusive web experiences that work for everyone...",
    author: "Maya Johnson",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    date: "Dec 10, 2024",
    readTime: "7 min read",
    likes: 245,
    comments: 41,
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop",
    tags: ["Design", "A11y"],
    featured: false,
  },
  {
    id: 6,
    title: "Introduction to AI-Powered Development Tools",
    excerpt: "Explore how AI is revolutionizing the way we write and debug code...",
    author: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    date: "Dec 8, 2024",
    readTime: "9 min read",
    likes: 421,
    comments: 89,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    tags: ["AI", "Tools"],
    featured: false,
  },
];

const categories = ["All", "Technology", "Web Dev", "Design", "AI", "Tutorial"];

const Blogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts.find((post) => post.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="max-w-2xl mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Explore Blogs
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover stories, thinking, and expertise from writers on any topic.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-card border-border"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {featuredPost && selectedCategory === "All" && !searchQuery && (
            <div className="mb-12 animate-fade-in" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Featured</span>
              </div>
              <Link to={`/blog/${featuredPost.id}`} className="group">
                <div className="grid md:grid-cols-2 gap-8 bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-video md:aspect-auto">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex gap-2 mb-4">
                      {featuredPost.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <img
                        src={featuredPost.avatar}
                        alt={featuredPost.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{featuredPost.author}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{featuredPost.date}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {featuredPost.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.filter(post => !post.featured || selectedCategory !== "All" || searchQuery).map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${(index + 2) * 50}ms` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{post.author}</p>
                        <p className="text-muted-foreground text-xs">{post.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No posts found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Blogs;

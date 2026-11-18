import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Clock, User, Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const fetchBlog = async (id: string) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.blog;
};

const fetchComments = async (id: string) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${id}/comments`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.comments;
};

const Blog = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => fetchBlog(id!),
    enabled: !!id,
  });

  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id!),
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${id}/like`, {
          method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to like post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: content }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setCommentText("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to like this post.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to comment.",
        variant: "destructive",
      });
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 text-center">
          Loading blog...
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 text-center text-red-500">
          Error fetching blog or blog not found. Please try again later.
        </div>
      </div>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const readTime = `${Math.ceil(blog.content.split(' ').length / 200)} min read`;

  const isLiked = blog.likes?.includes(user?._id);
  const likesCount = blog.likes?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <article className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-4xl">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">{blog.title}</h1>
          <div className="flex items-center gap-4 mb-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10">
                {blog.author?.avatar && <AvatarImage src={blog.author.avatar} alt={blog.author.name} />}
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <span>{blog.author?.name || 'Unknown author'}</span>
            </div>
            <span>•</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readTime}
            </span>
            <span className="flex items-center gap-1">
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                {likesCount} likes
            </span>
          </div>

          {blog.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img src={blog.coverImage} alt={blog.title} className="w-full h-auto object-cover" />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Interaction Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"} ({likesCount})
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                {comments?.length || 0} Comments
              </div>
            </div>

            {/* Comment Form */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4">Leave a comment</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button type="submit" disabled={commentMutation.isPending || !commentText.trim()}>
                  {commentMutation.isPending ? "Posting..." : "Post Comment"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {isCommentsLoading ? (
                <p className="text-muted-foreground">Loading comments...</p>
              ) : comments && comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment._id} className="flex gap-4 p-4 rounded-lg bg-card border border-border">
                    <Avatar className="w-10 h-10">
                      {comment.user?.avatar && <AvatarImage src={comment.user.avatar} alt={comment.user.name} />}
                      <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold mr-2">{comment.user?.name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {user?._id === comment.user?._id && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCommentMutation.mutate(comment._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-foreground">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Blog;

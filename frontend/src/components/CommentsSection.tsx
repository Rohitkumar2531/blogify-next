import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment, getBlogComments, deleteComment } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

interface CommentsSectionProps {
  blogId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ blogId }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get token from localStorage since AuthContext doesn't expose it
  const token = localStorage.getItem('token');

  const { data: comments, isLoading, isError } = useQuery<Comment[]>({
    queryKey: ['blogComments', blogId],
    queryFn: () => getBlogComments(blogId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (commentText: string) => addComment(blogId, commentText, token!),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['blogComments', blogId] });
      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(blogId, commentId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogComments', blogId] });
      toast.success('Comment deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && user && token) {
      addCommentMutation.mutate(newComment);
    } else if (!user) {
      toast.error('You need to be logged in to comment.');
    } else {
      toast.error('Comment cannot be empty.');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoading) return <div>Loading comments...</div>;
  if (isError) return <div>Error loading comments.</div>;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Comments ({comments?.length || 0})</h2>

      {user && (
        <form onSubmit={handleAddComment} className="mb-8 p-4 border rounded-lg bg-card shadow-sm">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-4 bg-background border-border focus-visible:ring-ring"
            rows={4}
          />
          <Button type="submit" disabled={addCommentMutation.isPending}>
            {addCommentMutation.isPending ? 'Adding Comment...' : 'Add Comment'}
          </Button>
        </form>
      )}

      {comments && comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm">
              <Avatar className="w-10 h-10">
                {comment.user.avatar && <AvatarImage src={comment.user.avatar} alt={comment.user.name} />}
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground">{comment.user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-foreground text-sm leading-relaxed">{comment.text}</p>
                {user?._id === comment.user._id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 mt-2 p-0 h-auto"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
      )}
    </section>
  );
};

export default CommentsSection;

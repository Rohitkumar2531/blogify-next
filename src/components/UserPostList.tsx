import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const fetchUserBlogs = async (userId: string, status: 'published' | 'draft') => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs?author=${userId}&status=${status}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.blogs;
};

interface Post {
  _id: string;
  title: string;
  createdAt: string;
}

interface UserPostListProps {
    userId: string;
    status: 'published' | 'draft';
}

export const UserPostList = ({ userId, status }: UserPostListProps) => {
    const navigate = useNavigate();
    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['userBlogs', userId, status],
        queryFn: () => fetchUserBlogs(userId, status),
    });

    if (isLoading) return <p className="text-muted-foreground">Loading posts...</p>;
    if (isError) return <p className="text-destructive">Error fetching posts.</p>;

    if (!posts || posts.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                <p>No {status} posts yet.</p>
                {status === 'published' && (
                  <Button className="mt-4" onClick={() => navigate('/write')}>
                      Write a Post
                  </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post: Post) => (
                <Link to={`/blog/${post._id}`} key={post._id} className="block p-4 border rounded-lg hover:bg-muted">
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </Link>
            ))}
        </div>
    );
};


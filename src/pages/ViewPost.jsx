// src/pages/ViewPost.jsx
// One recipe on its own page, with its stats. Opening the page records a view.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPostById } from '../api/posts.js';
import { trackEvent } from '../api/events.js';
import Header from '../components/Header.jsx';
import Post from '../components/Post.jsx';
import PostStats from '../components/PostStats.jsx';
import RecipeOwnerActions from '../components/RecipeOwnerActions.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ViewPost() {
  const { postId } = useParams();
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  // One random session ID per visit pairs this visit's start and end events
  const [session] = useState(() => crypto.randomUUID());

  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
  });

  useEffect(() => {
    // Count a view only after one second, so accidental clicks don't count
    const timer = setTimeout(async () => {
      try {
        await trackEvent({ postId, session, action: 'start_view' });
        // Refetch the stats so this view shows up right away
        queryClient.invalidateQueries({ queryKey: ['postStats', postId] });
      } catch {
        // A failed view event should never break reading the post
      }
    }, 1000);

    // Runs when the reader leaves the page: cancel a pending view, and
    // record the exit so the average read time can be calculated
    return () => {
      clearTimeout(timer);
      trackEvent({ postId, session, action: 'end_view' }).catch(() => {});
    };
  }, [postId, session, queryClient]);

  return (
    <main className="page">
      <Header />
      <p>
        <Link to="/">← Back to all recipes</Link>
      </p>

      {postQuery.isLoading && <p>Loading recipe...</p>}
      {postQuery.isError && <p className="error">Recipe not found.</p>}
      {postQuery.isSuccess && (
        <>
          <Post {...postQuery.data} fullPost />
          {userId && postQuery.data.author?._id === userId && (
            <RecipeOwnerActions recipe={postQuery.data} />
          )}
          <PostStats postId={postId} />
        </>
      )}
    </main>
  );
}

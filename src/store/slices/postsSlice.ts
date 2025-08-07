/**
 * Posts Redux Slice
 * 
 * This slice manages posts/content for infinite scroll functionality.
 * It handles fetching, pagination, and caching of posts data.
 * 
 * Features:
 * - Infinite scroll pagination
 * - Loading states for smooth UX
 * - Error handling for network issues
 * - Post interactions (like, bookmark, etc.)
 * - Optimistic updates for better performance
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

/**
 * Post Interface
 * 
 * Defines the shape of a post object in our application.
 * This represents content that users can scroll through.
 */
export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  imageUrl?: string;
}

/**
 * Posts State Interface
 * 
 * Defines the complete state shape for the posts slice.
 * Includes posts data, pagination, and loading states.
 */
interface PostsState {
  posts: Post[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  lastFetchTime: number | null;
}

/**
 * Initial State
 * 
 * Default state values when the app starts.
 */
const initialState: PostsState = {
  posts: [],
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  totalPages: 0,
  lastFetchTime: null,
};

/**
 * Mock Posts Generator
 * 
 * Generates mock posts for demonstration.
 * In a real app, this data would come from an API.
 */
const generateMockPosts = (page: number, limit: number = 10): Post[] => {
  const posts: Post[] = [];
  const startId = page * limit;
  
  for (let i = 0; i < limit; i++) {
    const id = (startId + i + 1).toString();
    posts.push({
      id,
      title: `Inspiring Post ${id}`,
      content: `This is the content for post ${id}. It contains valuable insights and interesting thoughts that users will enjoy reading. The content is engaging and designed to inspire interaction.`,
      author: {
        id: `user_${(i % 5) + 1}`,
        name: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown'][i % 5],
        avatar: undefined,
      },
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 100) + 1,
      comments: Math.floor(Math.random() * 20),
      isLiked: Math.random() > 0.7,
      isBookmarked: Math.random() > 0.8,
      tags: ['inspiration', 'motivation', 'life', 'goals', 'success'].slice(0, Math.floor(Math.random() * 3) + 1),
      imageUrl: Math.random() > 0.5 ? `https://picsum.photos/400/300?random=${id}` : undefined,
    });
  }
  
  return posts;
};

/**
 * Async Thunks
 * 
 * Handle asynchronous operations for posts data.
 */

/**
 * Fetch Posts Thunk
 * 
 * Fetches the initial set of posts (page 1).
 * Used for initial load and pull-to-refresh.
 */
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const posts = generateMockPosts(0, 10);
      
      return {
        posts,
        currentPage: 1,
        totalPages: 20, // Mock total pages
        hasMore: true,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch posts. Please check your connection.');
    }
  }
);

/**
 * Load More Posts Thunk
 * 
 * Fetches additional posts for infinite scroll.
 * Appends new posts to existing ones.
 */
export const loadMorePosts = createAsyncThunk(
  'posts/loadMorePosts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { posts: PostsState };
      const { currentPage, totalPages } = state.posts;
      
      // Check if there are more pages to load
      if (currentPage >= totalPages) {
        return rejectWithValue('No more posts to load');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const posts = generateMockPosts(currentPage, 10);
      
      return {
        posts,
        currentPage: currentPage + 1,
        hasMore: currentPage + 1 < totalPages,
      };
    } catch (error) {
      return rejectWithValue('Failed to load more posts. Please try again.');
    }
  }
);

/**
 * Like Post Thunk
 * 
 * Handles liking/unliking a post with optimistic updates.
 */
export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return postId;
    } catch (error) {
      return rejectWithValue('Failed to like post. Please try again.');
    }
  }
);

/**
 * Bookmark Post Thunk
 * 
 * Handles bookmarking/unbookmarking a post with optimistic updates.
 */
export const bookmarkPost = createAsyncThunk(
  'posts/bookmarkPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return postId;
    } catch (error) {
      return rejectWithValue('Failed to bookmark post. Please try again.');
    }
  }
);

/**
 * Posts Slice
 * 
 * Creates the Redux slice with reducers and actions.
 */
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    /**
     * Clear Error
     * 
     * Clears any error messages from the posts state.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Reset Posts
     * 
     * Clears all posts and resets pagination.
     * Useful for logout or data refresh.
     */
    resetPosts: (state) => {
      state.posts = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.error = null;
      state.lastFetchTime = null;
    },

    /**
     * Optimistic Like
     * 
     * Immediately updates like status for better UX.
     * Will be reverted if the API call fails.
     */
    optimisticLike: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
      }
    },

    /**
     * Optimistic Bookmark
     * 
     * Immediately updates bookmark status for better UX.
     */
    optimisticBookmark: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isBookmarked = !post.isBookmarked;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Posts Cases
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.hasMore;
        state.lastFetchTime = Date.now();
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load More Posts Cases
    builder
      .addCase(loadMorePosts.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMorePosts.fulfilled, (state, action) => {
        state.loadingMore = false;
        state.posts = [...state.posts, ...action.payload.posts];
        state.currentPage = action.payload.currentPage;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(loadMorePosts.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload as string;
      });

    // Like Post Cases
    builder
      .addCase(likePost.fulfilled, (state, action) => {
        // Like was successful, optimistic update already applied
      })
      .addCase(likePost.rejected, (state, action) => {
        // Revert optimistic like
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (post) {
          post.isLiked = !post.isLiked;
          post.likes += post.isLiked ? 1 : -1;
        }
        state.error = action.payload as string;
      });

    // Bookmark Post Cases
    builder
      .addCase(bookmarkPost.fulfilled, (state, action) => {
        // Bookmark was successful, optimistic update already applied
      })
      .addCase(bookmarkPost.rejected, (state, action) => {
        // Revert optimistic bookmark
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (post) {
          post.isBookmarked = !post.isBookmarked;
        }
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  resetPosts,
  optimisticLike,
  optimisticBookmark,
} = postsSlice.actions;

// Export reducer
export default postsSlice.reducer;
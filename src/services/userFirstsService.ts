import api from './api';

export interface UserFirstsFlags {
  has_created_fast: boolean;
  has_created_private_community: boolean;
  has_joined_reddit: boolean;
  has_added_a_partner: boolean;
  has_made_a_prayer_request: boolean;
  has_shared_a_victory: boolean;
  has_shared_with_a_friend: boolean;
}

export async function getUserFirsts(): Promise<UserFirstsFlags> {
  const { data } = await api.get('/user/firsts');
  // API sample: { success, message, statusCode, data: {...} }
  return (data?.data || {}) as UserFirstsFlags;
}

export async function markSharedWithFriend(): Promise<void> {
  await api.post('/user/firsts/shared-with-friend');
}

export async function markJoinedReddit(): Promise<void> {
  await api.post('/user/firsts/joined-reddit');
}

export default {
  getUserFirsts,
  markSharedWithFriend,
  markJoinedReddit,
};

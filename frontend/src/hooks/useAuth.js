import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, updateUserProfile } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const logout = async () => {
    return dispatch(logoutUser()).unwrap();
  };

  const updateProfile = async (profileData) => {
    return dispatch(updateUserProfile(profileData)).unwrap();
  };

  return {
    user,
    loading,
    error,
    logout,
    updateProfile
  };
};

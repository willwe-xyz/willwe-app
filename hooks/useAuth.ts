import { usePrivy } from "@privy-io/react-auth";

export const useAuth = () => {
  const { ready, authenticated, user, logout } = usePrivy();
  return { ready, authenticated, user, logout };
};
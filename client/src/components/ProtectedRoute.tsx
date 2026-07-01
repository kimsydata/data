import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "../api";
import { Spinner } from "./Feedback";

type Role = "user" | "admin";

interface AuthState {
  authenticated: boolean;
  uid?: number;
  role?: Role;
  username?: string;
  loading: boolean;
  refresh: () => Promise<void>;
  setAuth: (data: {
    authenticated: boolean;
    uid?: number;
    role?: Role;
    username?: string;
  }) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    authenticated: boolean;
    uid?: number;
    role?: Role;
    username?: string;
  }>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const me = await api.me();
      setState({
        authenticated: me.authenticated,
        uid: me.uid,
        role: me.role,
        username: me.username,
      });
    } catch {
      setState({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, loading, refresh, setAuth: setState }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// 보호 라우트
// - adminOnly=false(기본): 로그인(회원/관리자) 필요, 비로그인 시 /login
// - adminOnly=true: 관리자만, 비관리자 시 /admin/login
export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { authenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="인증 확인 중..." />;

  if (adminOnly) {
    if (!authenticated || role !== "admin") {
      return (
        <Navigate to="/admin/login" state={{ from: location }} replace />
      );
    }
  } else if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

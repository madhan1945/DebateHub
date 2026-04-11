import {
  useLocation,
  useNavigate,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from 'react-router-dom';

export function usePathname() {
  return useLocation().pathname;
}

export function useParams() {
  return useRouterParams();
}

export function useSearchParams() {
  const [params] = useRouterSearchParams();
  return params;
}

export function useRouter() {
  const navigate = useNavigate();

  return {
    push: (href) => navigate(href),
    replace: (href) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => {},
  };
}

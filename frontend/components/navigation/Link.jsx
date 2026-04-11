import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Link = forwardRef(function Link({ href, replace, scroll, prefetch, ...props }, ref) {
  return <RouterLink ref={ref} to={href} replace={replace} {...props} />;
});

export default Link;

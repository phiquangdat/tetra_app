import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function UserLayoutRoutes({ children }: Props) {
  return <div>{children}</div>;
}

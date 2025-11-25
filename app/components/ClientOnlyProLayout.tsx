'use client';

import { ProLayout } from '@ant-design/pro-components';
import { useState, useEffect } from 'react';
import type { ProLayoutProps } from '@ant-design/pro-components';

export default function ClientOnlyProLayout(props: ProLayoutProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <ProLayout {...props} />;
}

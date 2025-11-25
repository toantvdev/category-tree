'use client';

import { Button, Dropdown, MenuProps } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

const languages = [
  { key: 'en', label: 'EN' },
  { key: 'vi', label: 'VI' },
] as const;

export default function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale() as 'en' | 'vi';
  const [isPending, startTransition] = useTransition();

  const setLocale = (newLocale: 'en' | 'vi') => {
    document.cookie = `locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    startTransition(() => {
      router.refresh();
    });
  };

  const items: MenuProps['items'] = languages.map((lang) => ({
    key: lang.key,
    label: <span style={{ fontWeight: 500, fontSize: 13 }}>{lang.label}</span>,
    onClick: () => setLocale(lang.key),
    disabled: isPending,
    style: {
      backgroundColor: locale === lang.key ? '#e6f7ff' : undefined,
      color: locale === lang.key ? '#1890ff' : undefined,
      fontWeight: locale === lang.key ? 600 : 500,
      borderRadius: 4,
    },
  }));

  const current = languages.find((l) => l.key === locale)!;

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button
        type="default"
        size="small"
        loading={isPending}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 6px',
          height: 26,
          fontSize: 12,
          fontWeight: 600,
          minWidth: 52,
        }}
      >
        <GlobalOutlined style={{ fontSize: 13 }} />
        {current.label}
      </Button>
    </Dropdown>
  );
}

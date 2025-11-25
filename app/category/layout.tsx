'use client';

import ClientOnlyProLayout from '../components/ClientOnlyProLayout';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <ClientOnlyProLayout
      title="My Dashboard"
      logo="https://scontent.fhan17-1.fna.fbcdn.net/v/t39.30808-6/492068884_1219679086823883_4027248764894339918_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ee3Oyo_x4skQ7kNvwEJEeTA&_nc_oc=Adlqja0jQ1zm0J2dkmVbnuPUoai_BtyJlJByDvVx4Y65jOqBgnom-M-vGWkrQm9jxAk&_nc_zt=23&_nc_ht=scontent.fhan17-1.fna&_nc_gid=LKR7nupk8L16PkBAWFBXFw&oh=00_AfgfcG68LSofrPd8zIgQgKAFePx5lcFHCqOuwmhQTSJ1SQ&oe=692B15E4"
      fixSiderbar
      layout="mix"
      splitMenus={false}
      token={{
        header: {
          heightLayoutHeader: 56,
        },
      }}
      route={{
        routes: [
          { path: '/dashboard', name: 'Dashboard' },
          { path: '/dashboard/categories', name: 'Categories' },
        ],
      }}
      location={{ pathname }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) router.push(item.path);
          }}
        >
          {dom}
        </div>
      )}
      actionsRender={() => [
        <div
          key="header-actions"
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            paddingRight: 16,
          }}
        >
          <LanguageSwitcher />
          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: 'Profile' },
                { key: 'logout', label: 'Logout' },
              ],
            }}
          >
            <Avatar size="small" icon={<UserOutlined />} />
          </Dropdown>
        </div>,
      ]}
    >
      <div style={{ padding: 24 }}>{children}</div>
    </ClientOnlyProLayout>
  );
}

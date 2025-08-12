'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import APIKeySettings from '@/components/settings/APIKeySettings';
import DataPrivacySettings from '@/components/settings/DataPrivacySettings';
import BrandingSettings from '@/components/settings/BrandingSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <ProfileSettings />
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <NotificationSettings />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <SecuritySettings />
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card className="p-6">
            <APIKeySettings />
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6">
            <DataPrivacySettings />
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="p-6">
            <BrandingSettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
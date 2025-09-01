'use client';

import { useState } from 'react';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, List, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notificações</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas notificações e preferências
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Bell className="h-3 w-3" />
              <span>12 novas</span>
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Preferências</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Centro de Notificações</span>
              </CardTitle>
              <CardDescription>
                Veja todas as suas notificações em um só lugar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList userId="current-user" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações de Notificação</span>
              </CardTitle>
              <CardDescription>
                Personalize como você recebe notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferences userId="current-user" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

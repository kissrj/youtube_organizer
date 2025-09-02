'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  Mail,
  Smartphone,
  Globe,
  Slack,
  MessageSquare,
  Settings,
  Clock,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { NotificationPreference, NotificationChannel } from '@/lib/types';

interface NotificationPreferencesProps {
  userId: string;
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
    loadChannels();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/notifications/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
    }
  };

  const handleUpdatePreferences = async (data: Partial<NotificationPreference>) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updated = await response.json();
        setPreferences(updated);
      }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'PUSH':
        return <Smartphone className="h-4 w-4" />;
      case 'WEBHOOK':
        return <Globe className="h-4 w-4" />;
      case 'SLACK':
        return <Slack className="h-4 w-4" />;
      case 'DISCORD':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelLabel = (type: string) => {
    const labels = {
      EMAIL: 'Email',
      PUSH: 'Notificação Push',
      WEBHOOK: 'Webhook',
      SMS: 'SMS',
      SLACK: 'Slack',
      DISCORD: 'Discord'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return <div>Loading preferências...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Preferências de Notificação</h2>
          <p className="text-muted-foreground">
            Configure como e quando você recebe notificações
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Configure as preferências gerais de notificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Notificações</Label>
              <p className="text-sm text-muted-foreground">
                Ativar ou desativar todas as notificações
              </p>
            </div>
            <Switch
              checked={preferences?.enabled || false}
              onCheckedChange={(checked) =>
                handleUpdatePreferences({ enabled: checked })
              }
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Frequência</Label>
            <Select
              value={preferences?.frequency || 'IMMEDIATE'}
              onValueChange={(value: any) =>
                handleUpdatePreferences({ frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMMEDIATE">Imediato</SelectItem>
                <SelectItem value="HOURLY">A cada hora</SelectItem>
                <SelectItem value="DAILY">Diário</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="NEVER">Nunca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Horário Silencioso</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={preferences?.quietHours?.enabled || false}
                onCheckedChange={(checked) =>
                  handleUpdatePreferences({
                    quietHours: {
                      ...preferences?.quietHours,
                      enabled: checked
                    }
                  })
                }
              />
              <Label>Ativar horário silencioso</Label>
            </div>

            {preferences?.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Início</Label>
                  <Input
                    type="time"
                    value={preferences.quietHours.start || '22:00'}
                    onChange={(e) =>
                      handleUpdatePreferences({
                        quietHours: {
                          ...preferences.quietHours,
                          start: e.target.value
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm">Fim</Label>
                  <Input
                    type="time"
                    value={preferences.quietHours.end || '08:00'}
                    onChange={(e) =>
                      handleUpdatePreferences({
                        quietHours: {
                          ...preferences.quietHours,
                          end: e.target.value
                        }
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Canais Existentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Canais de Entrega</CardTitle>
              <CardDescription>
                Gerencie os canais onde você recebe notificações
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Canal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum canal configurado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione canais para receber notificações
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${channel.verified ? 'bg-green-100' : 'bg-muted'}`}>
                      {getChannelIcon(channel.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Label className="font-medium">{channel.name}</Label>
                        {channel.verified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {!channel.verified && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getChannelLabel(channel.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={channel.isActive}
                      onCheckedChange={(checked) => {
                        // Implementar atualização
                        console.log('Atualizando canal:', channel.id, checked);
                      }}
                    />
                    <div className="text-sm text-muted-foreground">
                      <div>Enviados: {channel.sentCount}</div>
                      <div>Falhas: {channel.failedCount}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('Remover canal:', channel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  X,
  Archive,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { Notification } from '@/lib/types';

interface NotificationListProps {
  userId: string;
}

export function NotificationList({ userId }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredCount = filteredNotifications.length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_VIDEO':
        return <Info className="h-4 w-4" />;
      case 'COLLECTION_UPDATED':
        return <Archive className="h-4 w-4" />;
      case 'SYNC_COMPLETED':
      case 'EXPORT_COMPLETED':
      case 'IMPORT_COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'SYNC_FAILED':
      case 'EXPORT_FAILED':
      case 'IMPORT_FAILED':
        return <AlertTriangle className="h-4 w-4" />;
      case 'SYSTEM_ALERT':
        return <AlertTriangle className="h-4 w-4" />;
      case 'REMINDER':
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      NEW_VIDEO: 'Novo Vídeo',
      VIDEO_UPDATED: 'Vídeo Atualizado',
      COLLECTION_UPDATED: 'Coleção Atualizada',
      FEED_UPDATED: 'Feed Atualizado',
      TAG_SUGGESTED: 'Tag Sugerida',
      SYNC_COMPLETED: 'Sincronização Concluída',
      SYNC_FAILED: 'Sincronização Falhou',
      EXPORT_COMPLETED: 'Exportação Concluída',
      EXPORT_FAILED: 'Exportação Falhou',
      IMPORT_COMPLETED: 'Importação Concluída',
      IMPORT_FAILED: 'Importação Falhou',
      SYSTEM_ALERT: 'Alerta do Sistema',
      REMINDER: 'Lembrete'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return <div>Carregando notificações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notificações</h2>
          <p className="text-muted-foreground">
            Gerencie suas notificações e preferências
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="NEW_VIDEO">Novo Vídeo</SelectItem>
                  <SelectItem value="COLLECTION_UPDATED">Coleção</SelectItem>
                  <SelectItem value="SYNC_COMPLETED">Sincronização</SelectItem>
                  <SelectItem value="EXPORT_COMPLETED">Exportação</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtradas</p>
                <p className="text-2xl font-bold text-green-600">{filteredCount}</p>
              </div>
              <Filter className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => {
                    const today = new Date();
                    const notificationDate = new Date(n.createdAt);
                    return today.toDateString() === notificationDate.toDateString();
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                  ? 'Tente ajustar seus filtros'
                  : 'Você não tem notificações no momento'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-blue-100' : 'bg-muted'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        <Badge variant={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="default">Nova</Badge>
                        )}
                      </div>
                      <CardDescription>{notification.message}</CardDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{getTypeLabel(notification.type)}</span>
                        <span>•</span>
                        <span>{new Date(notification.createdAt).toLocaleString('pt-BR')}</span>
                        {notification.sentAt && (
                          <>
                            <span>•</span>
                            <span>Enviado em {new Date(notification.sentAt).toLocaleString('pt-BR')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('Arquivar:', notification.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('Excluir:', notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

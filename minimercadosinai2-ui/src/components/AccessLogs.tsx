import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/services/api';
import type { AccessLog } from '@/types';
import { EVENT_TYPES } from '@/types';
import { RefreshCw, Clock, User, CheckCircle, XCircle } from 'lucide-react';

export function AccessLogs() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRecentAccessLogs(50);
      if (response.success && response.data) {
        setLogs(response.data.access_logs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('pt-BR');
  };

  const getEventBadge = (event: number) => {
    const isSuccess = event === 7;
    const isDenied = event === 6;
    
    return (
      <Badge variant={isSuccess ? 'default' : isDenied ? 'destructive' : 'secondary'}>
        {EVENT_TYPES[event] || `Evento ${event}`}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Registros de Acesso</h2>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Clock className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Liberados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((l) => l.event === 7).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Negados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.event === 6).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historico de Acessos</CardTitle>
          <CardDescription>Ultimos 50 registros de acesso do dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-zinc-500">Carregando registros...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">Nenhum registro encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Dispositivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono">{log.id}</TableCell>
                    <TableCell>{formatTime(log.time)}</TableCell>
                    <TableCell>{getEventBadge(log.event)}</TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_id}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{log.device_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import type { DeviceStatus } from '@/types';
import { Wifi, WifiOff, DoorOpen, RefreshCw } from 'lucide-react';

export function Dashboard() {
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [doorLoading, setDoorLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStatus();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a API');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDoor = async () => {
    setDoorLoading(true);
    try {
      await api.openDoor(1);
      alert('Porta aberta com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao abrir porta');
    } finally {
      setDoorLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Dispositivo</CardTitle>
            {status?.online ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-zinc-400">Carregando...</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  <Badge variant={status?.online ? 'default' : 'destructive'}>
                    {status?.online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-2">{status?.message}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IP do Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-zinc-400">Carregando...</div>
            ) : (
              <div className="text-2xl font-bold font-mono">{status?.device_ip || '-'}</div>
            )}
            <CardDescription className="mt-2">Endereco de rede do iDFlex Pro</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={status?.session_active ? 'default' : 'secondary'}>
                {status?.session_active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <CardDescription className="mt-2">Status da sessao com o dispositivo</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acoes Rapidas</CardTitle>
          <CardDescription>Controle remoto do dispositivo</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenDoor} disabled={doorLoading || !status?.online}>
            <DoorOpen className="mr-2 h-4 w-4" />
            {doorLoading ? 'Abrindo...' : 'Abrir Porta'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

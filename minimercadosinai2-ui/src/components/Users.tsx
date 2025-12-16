import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/services/api';
import type { User, UserCreate } from '@/types';
import { RefreshCw, Plus, Trash2, Users as UsersIcon } from 'lucide-react';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserCreate>({ id: 0, name: '', registration: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      alert('Preencha todos os campos obrigatorios');
      return;
    }

    setSubmitting(true);
    try {
      await api.createUser(formData);
      setDialogOpen(false);
      setFormData({ id: 0, name: '', registration: '' });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm(`Deseja realmente excluir o usuario ${userId}?`)) {
      return;
    }

    try {
      await api.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir usuario');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usuarios</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Novo Usuario</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo usuario no dispositivo iDFlex Pro
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="id">ID *</Label>
                    <Input
                      id="id"
                      type="number"
                      placeholder="Ex: 1001"
                      value={formData.id || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, id: parseInt(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Nome do usuario"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="registration">Matricula</Label>
                    <Input
                      id="registration"
                      placeholder="Numero de matricula (opcional)"
                      value={formData.registration || ''}
                      onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
            <CardDescription>Usuarios cadastrados no dispositivo</CardDescription>
          </div>
          <UsersIcon className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Usuarios cadastrados no iDFlex Pro</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-zinc-500">Carregando usuarios...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">Nenhum usuario cadastrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matricula</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.registration || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

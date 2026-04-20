import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, UserCog } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { UserRole } from '@/types/hotel';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function roleLabel(role: UserRole) {
  return role === 'admin' ? 'Admin' : 'Funcionário';
}

export default function Users() {
  const { user, isAdmin } = useAuth();
  const { users, loading, updatingUserId, setUserRole } = useUserManagement();

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso restrito</CardTitle>
        </CardHeader>
        <CardContent>
          Apenas administradores podem gerenciar usuários.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Usuários</h1>
        <Badge variant="outline" className="px-3 py-1.5">
          <UserCog className="h-4 w-4 mr-1" />
          {users.length} usuário(s)
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando usuários...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead>Permissão atual</TableHead>
                    <TableHead className="text-right">Alterar permissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((managedUser) => {
                    const isSelf = managedUser.user_id === user?.id;
                    const isUpdating = updatingUserId === managedUser.user_id;

                    return (
                      <TableRow key={managedUser.user_id}>
                        <TableCell className="font-medium">{managedUser.nome}</TableCell>
                        <TableCell>{managedUser.email}</TableCell>
                        <TableCell>
                          {managedUser.created_at
                            ? format(new Date(managedUser.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={managedUser.role === 'admin' ? 'default' : 'secondary'}>
                            {managedUser.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                            {roleLabel(managedUser.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={managedUser.role}
                              onValueChange={(value) => setUserRole(managedUser.user_id, value as UserRole)}
                              disabled={isUpdating || isSelf}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="funcionario">Funcionário</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            {isSelf && (
                              <Button variant="outline" size="sm" disabled>
                                Você
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

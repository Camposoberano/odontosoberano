import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProteticos, Protetico } from '@/hooks/useProteticos';

interface ProteticoFormProps {
  open: boolean;
  onClose: () => void;
  protetico?: Protetico;
}

const especialidades = [
  'Prótese Removível',
  'Prótese Fixa',
  'Prótese Total',
  'Prótese Parcial',
  'Implantodontia',
  'Cerâmica',
  'Metalurgia',
  'Ortodontia',
  'Geral'
];

export function ProteticoForm({ open, onClose, protetico }: ProteticoFormProps) {
  const { createProtetico, updateProtetico } = useProteticos();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    telefone: '',
    email: '',
    laboratorio: '',
    ativo: true
  });

  useEffect(() => {
    if (protetico) {
      setFormData({
        nome: protetico.nome || '',
        especialidade: protetico.especialidade || '',
        telefone: protetico.telefone || '',
        email: protetico.email || '',
        laboratorio: protetico.laboratorio || '',
        ativo: protetico.ativo
      });
    } else {
      setFormData({
        nome: '',
        especialidade: '',
        telefone: '',
        email: '',
        laboratorio: '',
        ativo: true
      });
    }
  }, [protetico, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (protetico) {
        result = await updateProtetico(protetico.id, formData);
      } else {
        result = await createProtetico(formData);
      }

      if (result) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {protetico ? 'Editar Protético' : 'Novo Protético'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="laboratorio">Laboratório</Label>
              <Input
                id="laboratorio"
                value={formData.laboratorio}
                onChange={(e) => handleChange('laboratorio', e.target.value)}
                placeholder="Nome do laboratório"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade</Label>
              <Select
                value={formData.especialidade}
                onValueChange={(value) => handleChange('especialidade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ativo">Status *</Label>
              <Select
                value={formData.ativo ? "true" : "false"}
                onValueChange={(value) => handleChange('ativo', value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

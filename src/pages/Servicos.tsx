import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, BriefcaseBusiness } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface Servico {
  id: string;
  tipo: string;
  valor1: number;
  valor2: number;
  valor3: number;
  valor4: number;
}

const Servicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      tipo: "",
      valor1: 0,
      valor2: 0,
      valor3: 0,
      valor4: 0
    }
  });

  
  useEffect(() => {
    const fetchServicos = async () => {
      const servicosCol = collection(db, "servicos");
      const servicosSnapshot = await getDocs(servicosCol);
      const servicosList = servicosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Servico[];
      setServicos(servicosList);
    };
    fetchServicos();
  }, []);

 
  const onSubmit = async (data: any) => {
    if (editingServico) {
      const servicoRef = doc(db, "servicos", editingServico.id);
      await updateDoc(servicoRef, data);
      setServicos(prev => prev.map(servico =>
        servico.id === editingServico.id
          ? { ...servico, ...data }
          : servico
      ));
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    } else {
      const docRef = await addDoc(collection(db, "servicos"), data);
      setServicos(prev => [...prev, { id: docRef.id, ...data }]);
      toast({
        title: "Serviço adicionado",
        description: "O novo serviço foi adicionado com sucesso.",
      });
    }
    setIsDialogOpen(false);
    setEditingServico(null);
    form.reset();
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    form.setValue("tipo", servico.tipo);
    form.setValue("valor1", servico.valor1);
    form.setValue("valor2", servico.valor2);
    form.setValue("valor3", servico.valor3);
    form.setValue("valor4", servico.valor4);
    setIsDialogOpen(true);
  };

  
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "servicos", id));
    setServicos(prev => prev.filter(servico => servico.id !== id));
    toast({
      title: "Serviço removido",
      description: "O serviço foi removido com sucesso.",
      variant: "destructive"
    });
  };

  const handleAddNew = () => {
    setEditingServico(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços e preços do seu negócio
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-[#4880FF] hover:bg-[#2563eb]">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingServico ? "Editar Serviço" : "Adicionar Novo Serviço"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Corte e Barba" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valor1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor 1</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="valor2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor 2</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="valor3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor 3</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="valor4"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor 4</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingServico ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5" />
            Lista de Serviços
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {servicos.length} {servicos.length === 1 ? 'serviço' : 'serviços'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="font-semibold">Tipo de serviço</TableHead>
                  <TableHead className="font-semibold text-center">Valor 1</TableHead>
                  <TableHead className="font-semibold text-center">Valor 2</TableHead>
                  <TableHead className="font-semibold text-center">Valor 3</TableHead>
                  <TableHead className="font-semibold text-center">Valor 4</TableHead>
                  <TableHead className="font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicos.map((servico) => (
                  <TableRow key={servico.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{servico.tipo}</TableCell>
                    <TableCell className="text-center">
                      R$ {servico.valor1.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-center">
                      R$ {servico.valor2.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-center">
                      R$ {servico.valor3.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-center">
                      R$ {servico.valor4.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(servico)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(servico.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {servicos.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <BriefcaseBusiness className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum serviço cadastrado</p>
              <p className="text-sm">Clique em "Adicionar" para criar seu primeiro serviço</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Servicos;

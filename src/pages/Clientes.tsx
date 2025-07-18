import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, Mail, MapPin } from "lucide-react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  address?: string;
  services?: number;
}

function formatPhone(value: string) {
  let cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 7)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

function formatCPF(value: string) {
  let cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    address: ""
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? "",
          cpf: data.cpf ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          address: data.address ?? ""
        } as Client;
      });
      setClients(clientsList);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchHistorico = async () => {
      const agendSnap = await getDocs(collection(db, "agendamentos"));
      setHistorico(agendSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchHistorico();
  }, []);


  const getServicosRealizados = (clientId: string) => {
    return historico.filter(
      (item) => item.client === clientId && item.status === "Concluído"
    ).length;
  };

  const handleAddClient = async () => {
    if (newClient.phone.replace(/\D/g, "").length !== 11) {
      alert("O telefone deve conter 11 dígitos.");
      return;
    }
    if (newClient.cpf.replace(/\D/g, "").length !== 11) {
      alert("O CPF deve conter 11 dígitos.");
      return;
    }
    try {
      await addDoc(collection(db, "clientes"), newClient);
      setIsDialogOpen(false);
      setNewClient({
        name: "",
        cpf: "",
        phone: "",
        email: "",
        address: ""
      });

      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? "",
          cpf: data.cpf ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          address: data.address ?? ""
        } as Client;
      });
      setClients(clientsList);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, "clientes", id));
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditClient(client);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditClient = async () => {
    if (!editClient) return;
    if (editClient.phone.replace(/\D/g, "").length !== 11) {
      alert("O telefone deve conter 11 dígitos.");
      return;
    }
    if (editClient.cpf.replace(/\D/g, "").length !== 11) {
      alert("O CPF deve conter 11 dígitos.");
      return;
    }
    try {
      await updateDoc(doc(db, "clientes", editClient.id), {
        name: editClient.name,
        cpf: editClient.cpf,
        phone: editClient.phone,
        email: editClient.email,
        address: editClient.address
      });
      setClients((prev) =>
        prev.map((c) => (c.id === editClient.id ? { ...editClient } : c))
      );
      setIsEditDialogOpen(false);
      setEditClient(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert("Erro ao salvar alterações!");
    }
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50 transition">
          Cliente cadastrado/alterado com sucesso!
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir o cliente <b>{clientToDelete?.name}</b>?</p>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => {
                if (clientToDelete) {
                  await handleDeleteClient(clientToDelete.id);
                  setIsDeleteDialogOpen(false);
                  setClientToDelete(null);
                }
              }}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editClient && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={editClient.name}
                  onChange={(e) => setEditClient({ ...editClient, name: e.target.value.slice(0, 30) })}
                  placeholder="Nome completo"
                  maxLength={30}
                />
              </div>
              <div>
                <Label htmlFor="edit-cpf">CPF *</Label>
                <Input
                  id="edit-cpf"
                  value={editClient.cpf}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    setEditClient({ ...editClient, cpf: formatted });
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Telefone *</Label>
                <Input
                  id="edit-phone"
                  value={editClient.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setEditClient({ ...editClient, phone: formatted });
                  }}
                  placeholder="(11) 99999-9999"
                  maxLength={16}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editClient.email}
                  onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Endereço</Label>
                <Input
                  id="edit-address"
                  value={editClient.address}
                  onChange={(e) => setEditClient({ ...editClient, address: e.target.value })}
                  placeholder="Rua, Nº, Bairro, Cep"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSaveEditClient}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie sua base de clientes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value.slice(0, 30) })}
                    placeholder="Nome completo"
                    maxLength={30}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={newClient.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setNewClient({ ...newClient, cpf: formatted });
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setNewClient({ ...newClient, phone: formatted });
                    }}
                    placeholder="(11) 99999-9999"
                    maxLength={16}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="Rua, Nº, Bairro, Cep"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleAddClient}>
                    Cadastrar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{client.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {client.address}
                  </div>
                )}
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Serviços realizados:</span>
                    <span className="font-medium">{getServicosRealizados(client.id)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => handleEditClient(client)}
                >
                  Ver Detalhes
                </Button>
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={() => {
                    setClientToDelete(client);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  Excluir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default Clientes;
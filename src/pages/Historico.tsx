import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Calendar, DollarSign, BriefcaseBusiness, BarChart3, Filter, X } from "lucide-react";

const statusOptions = ["Todos", "Concluído", "Cancelado", "Agendado"];

const Historico = () => {
  const [historico, setHistorico] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  
  useEffect(() => {
    const fetchData = async () => {
      const agendSnap = await getDocs(collection(db, "agendamentos"));
      const agendList = agendSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistorico(agendList);

      const clientsSnap = await getDocs(collection(db, "clientes"));
      setClients(clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const servicosSnap = await getDocs(collection(db, "servicos"));
      setServiceTypes(servicosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  
  const getClienteNome = (id: string) => clients.find(c => c.id === id)?.name || "Cliente";
  const getClienteTelefone = (id: string) => clients.find(c => c.id === id)?.telefone || "";
  const getServicoTipo = (id: string) => serviceTypes.find(s => s.id === id)?.tipo || "Serviço";

  const filteredHistorico = historico.filter(servico => {
    const clienteNome = getClienteNome(servico.client);
    const servicoTipo = getServicoTipo(servico.service);
    const matchesSearch =
      clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicoTipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.id.includes(searchTerm);

    const matchesDate = !filterDate || servico.date === filterDate;
    const matchesService = filterService === "Todos" || servicoTipo === filterService;
    const matchesStatus = filterStatus === "Todos" || servico.status === filterStatus;

    return matchesSearch && matchesDate && matchesService && matchesStatus;
  });

  const totalFaturado = filteredHistorico.reduce((total, servico) => total + Number(servico.valor || 0), 0);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setFilterService("Todos");
    setFilterStatus("Todos");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Concluído":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case "Cancelado":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      case "Agendado":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Serviços</h1>
          <p className="text-muted-foreground">
            Acompanhe todos os serviços realizados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Serviços
            </CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredHistorico.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Faturado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalFaturado.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Médio
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {filteredHistorico.length > 0 ? (totalFaturado / filteredHistorico.length).toFixed(2).replace('.', ',') : '0,00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div>
              <Input
                type="date"
                placeholder="Filtrar por data"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="Todos" value="Todos">
                  Todos
                </SelectItem>
                {serviceTypes.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.tipo}>
                    {tipo.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status do serviço" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistorico.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{getClienteNome(servico.client)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {servico.date
                        ? servico.date.split("-").reverse().join("/")
                        : ""}
                    </div>
                  </TableCell>
                  <TableCell>{getServicoTipo(servico.service)}</TableCell>
                  <TableCell>
                    {getStatusBadge(servico.status)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      R$ {servico.valor ? Number(servico.valor).toFixed(2).replace('.', ',') : "0,00"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredHistorico.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhum serviço encontrado com os filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Historico;

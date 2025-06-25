
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Calendar, DollarSign, Scissors, BarChart3, Filter, X } from "lucide-react";

const mockHistorico = [
  {
    id: "00431",
    cliente: "Max Steel",
    telefone: "(68) 3892-9204",
    procedimento: "Higienização",
    valor: 45.00,
    data: "2024-06-15",
    horario: "14:30",
    status: "Concluído"
  },
  {
    id: "00430",
    cliente: "Erica Santos",
    telefone: "(98) 2644-2923",
    procedimento: "Higienização",
    valor: 60.00,
    data: "2024-06-14",
    horario: "16:00",
    status: "Concluído"
  },
  {
    id: "00429",
    cliente: "João Silva",
    telefone: "(87) 3790-4740",
    procedimento: "Dedetização",
    valor: 25.00,
    data: "2024-06-13",
    horario: "10:15",
    status: "Concluído"
  },
  {
    id: "00428",
    cliente: "Maria Oliveira",
    telefone: "(84) 3425-1505",
    procedimento: "Limpeza á Seco",
    valor: 120.00,
    data: "2024-06-12",
    horario: "09:00",
    status: "Cancelado"
  },
  {
    id: "00427",
    cliente: "Pedro Costa",
    telefone: "(91) 2156-7037",
    procedimento: "Dedetização",
    valor: 35.00,
    data: "2024-06-11",
    horario: "15:45",
    status: "Concluído"
  },
  {
    id: "00426",
    cliente: "Ana Maria",
    telefone: "(85) 2233-7794",
    procedimento: "Limpeza à Vapor",
    valor: 80.00,
    data: "2024-06-10",
    horario: "11:30",
    status: "Concluído"
  },
  {
    id: "00425",
    cliente: "Carlos Santos",
    telefone: "(88) 2696-2711",
    procedimento: "Limpeza com extração",
    valor: 70.00,
    data: "2024-06-09",
    horario: "14:00",
    status: "Agendado"
  }
];

const tiposServico = ["Todos", "Desodorização", "Higienização", "Limpeza a Vapor", "Limpeza a Seco", "Limpeza com extração", "Dedetização"];
const statusOptions = ["Todos", "Concluído", "Cancelado", "Agendado"];

const Historico = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const filteredHistorico = mockHistorico.filter(servico => {
    const matchesSearch = servico.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.procedimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.id.includes(searchTerm);
    
    const matchesDate = !filterDate || servico.data === filterDate;
    const matchesService = filterService === "Todos" || servico.procedimento === filterService;
    const matchesStatus = filterStatus === "Todos" || servico.status === filterStatus;
    
    return matchesSearch && matchesDate && matchesService && matchesStatus;
  });

  const totalFaturado = filteredHistorico.reduce((total, servico) => total + servico.valor, 0);

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
            <Scissors className="h-4 w-4 text-muted-foreground" />
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
                {tiposServico.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
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
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistorico.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell className="font-medium">{servico.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{servico.cliente}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{servico.telefone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(servico.data).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>{servico.procedimento}</TableCell>
                  <TableCell>
                    {getStatusBadge(servico.status)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">
                      R$ {servico.valor.toFixed(2).replace('.', ',')}
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

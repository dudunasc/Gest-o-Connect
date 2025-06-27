import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    client: "",
    service: "",
    date: "",
    time: "",
    location: ""
  });
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(data);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(data);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      const querySnapshot = await getDocs(collection(db, "servicos"));
      const tipos = Array.from(
        new Set(querySnapshot.docs.map(doc => doc.data().tipo))
      ).filter(Boolean);
      setServiceTypes(tipos as string[]);
    };
    fetchServiceTypes();
  }, []);

  const handleAddService = async () => {
    if (!newService.client || !newService.service || !newService.date || !newService.time || !newService.location) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    try {
      await addDoc(collection(db, "agendamentos"), {
        client: newService.client,
        service: newService.service,
        date: newService.date,
        time: newService.time,
        location: newService.location,
        status: "Agendado"
      });
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(data);
      setIsDialogOpen(false);
      setNewService({
        client: "",
        service: "",
        date: "",
        time: "",
        location: ""
      });
    } catch (error) {
      alert("Erro ao salvar agendamento!");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const agendamentoRef = doc(db, "agendamentos", id);
      await updateDoc(agendamentoRef, { status });
      setServices((prev) =>
        prev.map((service) =>
          service.id === id ? { ...service, status } : service
        )
      );
    } catch (error) {
      alert("Erro ao atualizar status!");
    }
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos de serviços
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendamento de serviços</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={newService.client}
                  onValueChange={(value) => setNewService({ ...newService, client: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service">Serviço *</Label>
                <Select
                  value={newService.service}
                  onValueChange={(value) => setNewService({ ...newService, service: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newService.date}
                    onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newService.time}
                    onChange={(e) => setNewService({ ...newService, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Local *</Label>
                <Textarea
                  id="location"
                  value={newService.location}
                  onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                  placeholder="Endereço do serviço"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleAddService}>
                  Cadastrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Serviços do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDate && (
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              )}
              {services.filter(service =>
                service.date === format(selectedDate ?? new Date(), "yyyy-MM-dd")
              ).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum serviço agendado para esta data
                </p>
              ) : (
                services
                  .filter(service =>
                    service.date === format(selectedDate ?? new Date(), "yyyy-MM-dd")
                  )
                  .map((service) => (
                    <div key={service.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {clients.find((c) => c.id === service.client)?.name || "Cliente"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {service.service || "Serviço"}
                          </p>
                          <p className="text-sm text-muted-foreground">{service.time}</p>
                          <p className="text-sm text-muted-foreground">{service.location}</p>
                        </div>
                        {service.status === "Concluído" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {service.status}
                          </span>
                        ) : service.status === "Cancelado" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {service.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {service.status}
                          </span>
                        )}
                      </div>
                      {service.status === "Agendado" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateStatus(service.id, "Concluído")}
                          >
                            Concluir
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(service.id, "Cancelado")}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Agenda;

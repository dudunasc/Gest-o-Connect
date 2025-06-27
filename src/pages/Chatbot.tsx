import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Settings, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const messageTemplates = [
  {
    id: 1,
    name: "Lembrete de Serviço",
    message: "Olá {cliente}, seu serviço de {tipo_servico} está agendado para {data}. Confirme sua presença!"
  },
  {
    id: 2,
    name: "Pós-Serviço",
    message: "Obrigado por escolher nossos serviços, {cliente}! Como foi sua experiência? Sua opinião é muito importante!"
  },
  {
    id: 3,
    name: "Promoção",
    message: "🎉 Oferta especial para você, {cliente}! 20% de desconto no próximo serviço. Válido até {data_limite}!"
  }
];

const Chatbot = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [autoReminders, setAutoReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState("1");
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [serviceFilter, setServiceFilter] = useState("all");

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name ?? "",
        phone: doc.data().phone?.replace(/\D/g, "") ?? "",
        services: doc.data().services ?? ""
      }));
      setClients(clientsList);
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    if (serviceFilter === "all") return true;
    if (serviceFilter === "higienizacao") {
      return (
        typeof client.services === "string"
          ? client.services.toLowerCase().includes("higienização")
          : client.services === "Higienização"
      );
    }
    return true;
  });

  const handleSendMessage = () => {
    if (!customMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar",
        variant: "destructive"
      });
      return;
    }

    const destinatarios = clients.filter(c => selectedClients.includes(c.id));
    if (destinatarios.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um cliente",
        variant: "destructive"
      });
      return;
    }

    destinatarios.forEach(client => {
      if (client.phone && client.phone.length === 11) {
        const msg = customMessage.replace("{cliente}", client.name);
        const msgEncoded = encodeURIComponent(msg);
        const url = `https://wa.me/55${client.phone}?text=${msgEncoded}`;
        window.open(url, "_blank");
      }
    });

    toast({
      title: "Campanha iniciada!",
      description: "As mensagens foram abertas no WhatsApp para cada cliente selecionado."
    });

    setCustomMessage("");
    setSelectedClients([]);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === parseInt(templateId));
    if (template) {
      setCustomMessage(template.message);
      setSelectedTemplate(templateId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chatbot e Mensagens</h1>
        <p className="text-muted-foreground">
          Configure mensagens automáticas e envie comunicados para clientes
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template">Template de Mensagem</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Mensagem Personalizada</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem aqui... Use {cliente}, {data}, {tipo_servico} para personalizar"
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="serviceFilter">Filtrar por Serviço</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  <SelectItem value="higienizacao">Higienização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Selecionar Clientes</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {filteredClients.map(client => (
                  <div key={client.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => {
                        setSelectedClients(prev =>
                          prev.includes(client.id)
                            ? prev.filter(id => id !== client.id)
                            : [...prev, client.id]
                        );
                      }}
                    />
                    <span>{client.name} - {client.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSendMessage} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar pelo WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Automação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes Automáticos</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar lembretes automáticos de agendamentos
                </p>
              </div>
              <Switch
                checked={autoReminders}
                onCheckedChange={setAutoReminders}
              />
            </div>

            {autoReminders && (
              <div>
                <Label htmlFor="reminderDays">Enviar lembrete com antecedência de</Label>
                <Select value={reminderDays} onValueChange={setReminderDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="2">2 dias</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">1 semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mensagens Pós-Serviço</Label>
                <p className="text-sm text-muted-foreground">
                  Solicitar feedback após conclusão do serviço
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Campanhas Promocionais</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar ofertas e promoções automáticas
                </p>
              </div>
              <Switch />
            </div>

            <Button variant="outline" className="w-full">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates de Mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messageTemplates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTemplateSelect(template.id.toString())}
                  >
                    Usar Template
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{template.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Mensagens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Lembrete de agendamento</p>
                <p className="text-sm text-muted-foreground">Enviado para 5 clientes • Há 2 horas</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Entregue</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Solicitação de feedback</p>
                <p className="text-sm text-muted-foreground">Enviado para 3 clientes • Ontem</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Entregue</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Promoção de 20% de desconto</p>
                <p className="text-sm text-muted-foreground">Enviado para 10 clientes • Há 3 dias</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Entregue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Chatbot;
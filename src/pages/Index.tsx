import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, Clock } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const meses = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const dashboardDataDefault = {
  stats: [
    {
      title: "Clientes",
      value: "0",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Nossos serviços",
      value: "0",
      icon: Package,
      color: "bg-blue-500"
    },
    {
      title: "Faturamento mensal",
      value: "R$ 0,00",
      icon: DollarSign,
      color: "bg-blue-500"
    },
    {
      title: "Serviços agendados",
      value: "0",
      icon: Clock,
      color: "bg-blue-500"
    }
  ]
};

const Index = () => {
  const [clientCount, setClientCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [agendadosCount, setAgendadosCount] = useState(0);
  const [faturamentoMensal, setFaturamentoMensal] = useState(0);
  const [ultimoServico, setUltimoServico] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ month: string, value: number }[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      setClients(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setClientCount(querySnapshot.size);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, "servicos"));
      setServiceTypes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setServiceCount(querySnapshot.size);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchAgendados = async () => {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const agendados = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return (data.status || "").trim().toLowerCase() === "agendado";
      });
      setAgendadosCount(agendados.length);
    };
    fetchAgendados();
  }, []);

  useEffect(() => {
    const fetchFaturamento = async () => {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let total = 0;
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (
          (data.status || "").trim().toLowerCase() === "concluído" &&
          data.valor &&
          data.date
        ) {
          const dataDate = new Date(data.date);
          if (
            dataDate.getMonth() === currentMonth &&
            dataDate.getFullYear() === currentYear
          ) {
            total += Number(data.valor);
          }
        }
      });
      setFaturamentoMensal(total);
    };
    fetchFaturamento();
  }, []);

  useEffect(() => {
    const fetchUltimoServico = async () => {
      const agendSnap = await getDocs(collection(db, "agendamentos"));
      const agendConcluidos = agendSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => (a.status || "").trim().toLowerCase() === "concluído" && a.date);

      if (agendConcluidos.length === 0) {
        setUltimoServico(null);
        return;
      }

      agendConcluidos.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
        const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
        return dateB.getTime() - dateA.getTime();
      });

      const ultimo = agendConcluidos[0];
      const cliente = clients.find(c => c.id === ultimo.client);
      const servico = serviceTypes.find(s => s.id === ultimo.service);

      setUltimoServico({
        nome: cliente?.name || "Cliente",
        servico: servico?.tipo || "Serviço",
        data: ultimo.date,
        horario: ultimo.time,
        valor: ultimo.valor,
        endereco: ultimo.location
      });
    };

    if (clients.length > 0 && serviceTypes.length > 0) {
      fetchUltimoServico();
    }
  }, [clients, serviceTypes]);

  useEffect(() => {
    const fetchChartData = async () => {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const valoresPorMes: { [key: string]: number } = {};

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (
          (data.status || "").trim().toLowerCase() === "concluído" &&
          data.valor &&
          data.date
        ) {
          const dataDate = new Date(data.date);
          const mes = dataDate.getMonth();
          const ano = dataDate.getFullYear();
          const chave = `${ano}-${mes}`;
          valoresPorMes[chave] = (valoresPorMes[chave] || 0) + Number(data.valor);
        }
      });

      const now = new Date();
      const anoAtual = now.getFullYear();
      const chart = meses.map((nomeMes, idx) => {
        const chave = `${anoAtual}-${idx}`;
        return {
          month: nomeMes,
          value: valoresPorMes[chave] || 0
        };
      });
      setChartData(chart);
    };
    fetchChartData();
  }, []);

  const dashboardData = {
    ...dashboardDataDefault,
    stats: dashboardDataDefault.stats.map((stat) => {
      if (stat.title === "Clientes") {
        return { ...stat, value: clientCount.toString() };
      }
      if (stat.title === "Nossos serviços") {
        return { ...stat, value: serviceCount.toString() };
      }
      if (stat.title === "Serviços agendados") {
        return { ...stat, value: agendadosCount.toString() };
      }
      if (stat.title === "Faturamento mensal") {
        return { ...stat, value: `R$ ${faturamentoMensal.toFixed(2).replace('.', ',')}` };
      }
      return stat;
    }),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`R$ ${value}`, 'Faturamento']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4F46E5" 
                strokeWidth={3}
                dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Último Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {ultimoServico ? (
            <div className="space-y-2">
              <div className="font-bold">{ultimoServico.nome}</div>
              <div className="text-sm text-muted-foreground">{ultimoServico.servico}</div>
              <div className="text-sm text-muted-foreground">
                {ultimoServico.data
                  ? new Date(ultimoServico.data).toLocaleDateString("pt-BR")
                  : ""}
                {ultimoServico.horario ? ` - ${ultimoServico.horario}` : ""}
              </div>
              <div className="text-sm text-muted-foreground">
                {ultimoServico.endereco}
              </div>
              <div className="text-green-700 font-semibold">
                {ultimoServico.valor
                  ? `Valor: R$ ${Number(ultimoServico.valor).toFixed(2).replace('.', ',')}`
                  : "Você não recebeu valor por esse serviço"}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">Nenhum serviço concluído encontrado.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Index;
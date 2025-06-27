import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, Clock } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

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
      value: "R$ 3.064,00",
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

const chartData = [
  { month: "Jan", value: 1000 },
  { month: "Fev", value: 1200 },
  { month: "Mar", value: 900 },
  { month: "Abr", value: 1800 },
  { month: "Mai", value: 2500 },
  { month: "Jun", value: 2200 },
  { month: "Jul", value: 3064 },
  { month: "Ago", value: 2800 },
  { month: "Set", value: 3200 },
  { month: "Out", value: 2900 },
  { month: "Nov", value: 3400 },
  { month: "Dez", value: 3100 }
];

const recentServices = [
  {
    name: "Max Steel",
    service: "Higienização - Sofá",
    date: "23/04/2024 - 10:30AM",
    location: "Cidade nova",
    price: "R$60,00",
    status: "Concluído"
  }
];

const Index = () => {
  const [clientCount, setClientCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [agendadosCount, setAgendadosCount] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      setClientCount(querySnapshot.size);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, "servicos"));
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
          <div className="space-y-4">
            {recentServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.service}</p>
                    <p className="text-sm text-muted-foreground">{service.date}</p>
                    <p className="text-sm text-muted-foreground">{service.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{service.price}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Index;
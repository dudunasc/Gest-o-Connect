import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

function getMonthYear(dateString: string) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

const Financeiro = () => {
  const [totalReceita, setTotalReceita] = useState(0);
  const [receitaAnterior, setReceitaAnterior] = useState(0);
  const [percentReceita, setPercentReceita] = useState(0);
  const [servicosRealizados, setServicosRealizados] = useState(0);
  const [servicosAnteriores, setServicosAnteriores] = useState(0);
  const [percentServicos, setPercentServicos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [ticketMedioAnterior, setTicketMedioAnterior] = useState(0);
  const [percentTicketMedio, setPercentTicketMedio] = useState(0);
  const [inadimplencia, setInadimplencia] = useState(0);
  const [inadimplenciaAnterior, setInadimplenciaAnterior] = useState(0);
  const [percentInadimplencia, setPercentInadimplencia] = useState(0);

  useEffect(() => {
    const fetchReceita = async () => {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const all = querySnapshot.docs.map(doc => doc.data()).filter(s => s.date);

      const concluidos = all.filter(servico => servico.status === "Concluído");
      const cancelados = all.filter(servico => servico.status === "Cancelado");
      const agendados = all.filter(servico => servico.status === "Agendado");

      const now = new Date();
      const mesAtual = `${now.getFullYear()}-${now.getMonth() + 1}`;
      const mesAnterior = `${now.getFullYear()}-${now.getMonth() === 0 ? 12 : now.getMonth()}`;

      const concluidosAtual = concluidos.filter(s => getMonthYear(s.date) === mesAtual);
      const concluidosAnt = concluidos.filter(s => getMonthYear(s.date) === mesAnterior);

      const receitaAtual = concluidosAtual.reduce((acc, s) => acc + Number(s.valor || 0), 0);
      const receitaAnt = concluidosAnt.reduce((acc, s) => acc + Number(s.valor || 0), 0);

      setTotalReceita(receitaAtual);
      setReceitaAnterior(receitaAnt);

      let percent = 0;
      if (receitaAnt > 0) {
        percent = ((receitaAtual - receitaAnt) / receitaAnt) * 100;
      } else if (receitaAtual > 0) {
        percent = 100;
      }
      setPercentReceita(percent);

      const servicosAtual = concluidosAtual.length;
      const servicosAnt = concluidosAnt.length;
      setServicosRealizados(servicosAtual);
      setServicosAnteriores(servicosAnt);

      let percentServ = 0;
      if (servicosAnt > 0) {
        percentServ = ((servicosAtual - servicosAnt) / servicosAnt) * 100;
      } else if (servicosAtual > 0) {
        percentServ = 100;
      }
      setPercentServicos(percentServ);

      const ticketAtual = servicosAtual > 0 ? receitaAtual / servicosAtual : 0;
      const ticketAnt = servicosAnt > 0 ? receitaAnt / servicosAnt : 0;
      setTicketMedio(ticketAtual);
      setTicketMedioAnterior(ticketAnt);

      let percentTicket = 0;
      if (ticketAnt > 0) {
        percentTicket = ((ticketAtual - ticketAnt) / ticketAnt) * 100;
      } else if (ticketAtual > 0) {
        percentTicket = 100;
      }
      setPercentTicketMedio(percentTicket);

      // Inadimplência
      const totalAtual = all.filter(s => getMonthYear(s.date) === mesAtual).length;
      const canceladosAtual = cancelados.filter(s => getMonthYear(s.date) === mesAtual).length;
      const inadimplenciaAtual = totalAtual > 0 ? (canceladosAtual / totalAtual) * 100 : 0;
      setInadimplencia(inadimplenciaAtual);

      const totalAnt = all.filter(s => getMonthYear(s.date) === mesAnterior).length;
      const canceladosAnt = cancelados.filter(s => getMonthYear(s.date) === mesAnterior).length;
      const inadimplenciaAnt = totalAnt > 0 ? (canceladosAnt / totalAnt) * 100 : 0;
      setInadimplenciaAnterior(inadimplenciaAnt);

      let percentInad = 0;
      if (inadimplenciaAnt > 0) {
        percentInad = ((inadimplenciaAtual - inadimplenciaAnt) / inadimplenciaAnt) * 100;
      } else if (inadimplenciaAtual > 0) {
        percentInad = 100;
      }
      setPercentInadimplencia(percentInad);
    };
    fetchReceita();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">
          Controle financeiro do seu negócio
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {percentReceita >= 0 ? "+" : ""}
              {percentReceita.toFixed(1)}% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços Realizados
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicosRealizados}</div>
            <p className="text-xs text-muted-foreground">
              
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketMedio > 0
                ? `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : "R$ 0,00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {percentTicketMedio >= 0 ? "+" : ""}
              {percentTicketMedio.toFixed(1)}% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inadimplência
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inadimplencia.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {percentInadimplencia >= 0 ? "+" : ""}
              {percentInadimplencia.toFixed(1)}% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Financeiro;

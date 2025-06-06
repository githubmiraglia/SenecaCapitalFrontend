export const navigationMap = {
  fundo: {
    label: "Fundo",
    children: {
      fundo: { label: "Escolha de Fundo" },
      classes: { label: "Escolha de Classes" },
    },
  },
  demonstracoes: {
    label: "Demonstrações",
    children: {
      balanco: {
        label: "Balanço",
        children: {
          balanco_administrador: {
            label: "Balanço Administrador",
            default_chart: {
              chart_type: "line",
              y_values: ["Caixa", "Investimentos de longo prazo"],
            },
          },
        },
      },
      resultado: {
        label: "Resultado",
        children: {
          resultado_administrador: {
            label: "Resultado Administrador",
            default_chart: {
              chart_type: "line",
              y_values: ["resultado do período"],
            },
          },
        },
      },
      fluxo_de_caixa: {
        label: "Fluxo de Caixa",
        children: {
          extrato: { label: "Extrato" },
          reconciliacao_administrador: {
            label: "Reconciliação Administrador",
            default_chart: {
              chart_type: "line",
              y_values: ["saldo de caixa"],
            },
          },
        },
      },
    },
  },
  cotas: {
    label: "Cotas",
    children: {
      cotas: {
        label: "Cotas",
        default_chart: {
          chart_type: "line",
          y_values: ["Valor da Cota Senior", "Valor da Cota Subordinada"],
        },
      },
    },
  },
  carteira: {
    label: "Carteira",
    children: {
      carteira_do_fundo: { label: "Carteira" },
      inadimplencia: { label: "Histórtico de Inadimplência" },
      rolagem: { label: "Tabela de Rolagem" },
    },
  },
  calendario: {
    label: "Calendário",
    children: {
      calendario_de_eventos: { label: "Eventos" },
    },
  },
  relatorios: {
    label: "Documentos",
    children: {
      repositorio_de_relatorios: { label: "Repositório" },
    },
  },
  politicas: {
    label: "Politicas",
    children: {
      politicas_da_gestora: { label: "Politicas da Gestora" },
    },
  },
  cadastros: {
    label: "Cadastros",
    children: {
      usuarios: {
        label: "Usuários",
        children: {
          usuariospage: { label: "Gerenciar Usuários" },
        },
      },
      investidor: {
        label: "Investidores",
        children: {
          investidorpage: { label: "Gerenciar Investidores" },
        },
      },
    },
  },
  tabelas: {
    label: "Tabelas",
    children: {
      tabelas_do_servidor: { label: "Tabelas do Servidor" },
    },
  },
};

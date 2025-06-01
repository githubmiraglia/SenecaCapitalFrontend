export const navigationMap = {
  fundo: {
    label: "Fundo",
    children: {
      fundo: "Escolha de Fundo",
      classes: "Escolha de Classes",
    },
  },
  demonstracoes: {
    label: "Demonstrações",
    children: {
      balanco: {
        label: "Balanço",
        children: {
          balanco_administrador: "Balanço Administrador",
          balanco_gerencial: "Balanço Gerencial",
        },
      },
      resultado: {
        label: "Resultado",
        children: {
          resultado_administrador: "Resultado Administrador",
          resultado_gerencial: "Resultado Gerencial",
        },
      },
      fluxo_de_caixa: {
        label:"Fluxo de Caixa",
        children: {
          extrato: "Extrato",
          reconciliacao_administrador: "Reconciliação Administrador",
          reconciliacao_gerencial: "Reconciliação Gerencial",
        }
      }
    },
  },
  cotas: {
    label: "Cotas",
    children: {
      cotas: "Cotas"
    },
  },
  carteira: {
    label: "Carteira",
    children: {
      carteira_do_fundo: "Carteira",
      inadimplencia: "Histórtico de Inadimplência",
      rolagem: "Tabela de Rolagem",
    },
  },
  calendario: {
    label: "Calendário",
    children: {
      calendario_de_eventos: "Eventos",
    },
  },  
  relatorios: {
    label: "Documentos",
    children: {
      repositorio_de_relatorios: "Repositório",
    },
  },
  politicas: {
    label: "Politicas",
    children: {
      politicas_da_gestora: "Politicas da Gestora",
    },
  },
  cadastros: {
    label: "Cadastros",
    children: {
      usuarios: {
        label: "Usuários",
        children: {
          usuariospage: "Gerenciar Usuários"
        },
      },
      investidor: {
        label: "Investidores",
        children: {
          investidorpage: "Gerenciar Investidores",
        },
      },
    },
  },
  tabelas: {
    label: "Tabelas",
    children: {
      tabela_de_indexadores: "Tabela de Indexadores",
      tabela_de_ir: "Tabela de IR",
      tabela_da_mae_joana: "Tabela da Mãe Joana",
    },
  },  
}

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
      calendario_de_eventos: "Eventos e Votações",
    },
  },  
  relatorios: {
    label: "Documentos e Relatórios",
    children: {
      repositorio_de_relatorios: "Repositório",
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
};

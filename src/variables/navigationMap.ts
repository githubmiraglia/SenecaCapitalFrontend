export const navigationMap = {
  fundo: {
    label: "Fundo",
    children: {
      fundo: { label: "Dados do Fundo" },
      classes: { label: "Classes" },
    },
  },
  demonstracoes: {
    label: "Demonstrações",
    children: {
      balanco: {
        label: "Balanço",
        children: {
          balanco_administrador: { label: "Administrador" },
          balanco_gerencial: { label: "Gerencial" },
        },
      },
      resultado: {
        label: "Resultado",
        children: {
          resultado_administrador: { label: "Administrador" },
          resultado_gerencial: { label: "Gerencial" },
        },
      },
      fluxo_de_caixa: {
        label: "Fluxo de Caixa",
        children: {
          extrato: { label: "Extrato" },
          reconciliacao_administrador: { label: "Reconc. Adm" },
          reconciliacao_gerencial: { label: "Reconc. Ger" },
        },
      },
    },
  },
  cotas: {
    label: "Cotas",
    children: {
      cotas: { label: "Cotas" },
    },
  },
  carteira: {
    label: "Carteira",
    children: {
      carteira_do_fundo: { label: "Carteira" },
      inadimplencia: { label: "Inadimplência" },
      rolagem: { label: "Rolagem" },
    },
  },
  calendario: {
    label: "Calendário",
    children: {
      calendario_de_eventos: { label: "Eventos" },
    },
  },
  relatorios: {
    label: "Relatórios",
    children: {
      repositorio_de_relatorios: { label: "Repositório" },
    },
  },
  cadastros: {
    label: "Cadastros",
    children: {
      usuarios: {
        label: "Usuários",
        children: {
          usuariospage: { label: "Usuários" },
        },
      },
      investidor: {
        label: "Investidores",
        children: {
          investidorpage: { label: "Investidores" },
        },
      },
    },
  },
  politicas: {
    label: "Políticas",
    children: {
      politicas_da_gestora: { label: "Políticas da Gestora" },
    },
  },
  tabelas: {
    label: "Tabelas",
    children: {
      tabelas_do_servidor: { label: "Tabelas do Servidor" },
      leitor_de_layout_de_cnab: { label: "Leitor de CNAB" },
  },
  },
};

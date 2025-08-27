import { UserPermissions } from "../types/Types";
import { currentVariables } from "../variables/generalVariables";

export const standardPermissions: UserPermissions = {
  fundo: {
    acesso: true,
    edicao: true,
    children: {
      fundo: { acesso: true, edicao: true },
      classes: { acesso: true, edicao: true },
    },
  },
  demonstracoes: {
    acesso: true,
    edicao: true,
    children: {
      balanco: {
        acesso: true,
        edicao: true,
        children: {
          balanco_administrador: { acesso: true, edicao: true },
          balanco_gerencial: { acesso: true, edicao: true },
        },
      },
      resultado: {
        acesso: true,
        edicao: true,
        children: {
          resultado_administrador: { acesso: true, edicao: true },
          resultado_gerencial: { acesso: true, edicao: true },
        },
      },
      fluxo_de_caixa: {
        acesso: true,
        edicao: true,
        children: {
          extrato: { acesso: true, edicao: true },
          reconciliacao_administrador: { acesso: true, edicao: true },
          reconciliacao_gerencial: { acesso: true, edicao: true },
        },
      },
    },
  },
  cotas: {
    acesso: true,
    edicao: true,
    children: {
      cotas: { acesso: true, edicao: true },
    },
  },
  carteira: {
    acesso: true,
    edicao: true,
    children: {
      carteira_do_fundo: { acesso: true, edicao: true },
      inadimplencia: { acesso: true, edicao: true },
      rolagem: { acesso: true, edicao: true },
    },
  },
  calendario: {
    acesso: true,
    edicao: true,
    children: {
      calendario_de_eventos: { acesso: true, edicao: true },
    },
  },
  relatorios: {
    acesso: true,
    edicao: true,
    children: {
      repositorio_de_relatorios: { acesso: true, edicao: true },
    },
  },
  cadastros: {
    acesso: true,
    edicao: true,
    children: {
      usuarios: {
        acesso: true,
        edicao: true,
        children: {
          usuariospage: { acesso: true, edicao: true },
        },
      },
      investidor: {
        acesso: true,
        edicao: true,
        children: {
          investidorpage: { acesso: true, edicao: true },
        },
      },
    },
  },
  politicas: {
    acesso: true,
    edicao: true,
    children: {
      politicas_da_gestora: { acesso: true, edicao: true },
    },
  },
  tabelas: {
    acesso: true,
    edicao: true,
    children: {
      tabelas_do_servidor: { acesso: true, edicao: true },
      TodosOsDados: { acesso: true, edicao: true },
    },
  },
};

export const userChosenPermissions: UserPermissions = JSON.parse(
  JSON.stringify(standardPermissions)
);

export const hasPermission = (key: string): boolean => {
  const keys = key.split(".");
  let node: any = currentVariables?.user?.userPermissions || standardPermissions;

  for (const part of keys) {
    if (!node || !node[part]) return false;
    node = node[part].children ?? node[part];
  }

  return node?.acesso === true;
};
